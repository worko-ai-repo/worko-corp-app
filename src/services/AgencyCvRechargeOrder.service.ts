
// Import razorpay sdk
import { Orders } from "razorpay/dist/types/orders";

// Import firestore package
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import daos
import { agencyCvRechargeOrderDao } from "../daos/AgencyCvRechargeOrder.dao";

// Import dtos
import { AgencyCvRechargeOrderCreateApiDto, AgencyCvRechargeOrderVerifyPaymentApiDto } from "../dtos/AgencyCvRechargeOrder.dto";

// Import enums
import { RazorpayPaymentOrderStatusEnum } from "../enums/RazorpayPayment.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import libraries
import { workoPaymentLibraryObj } from "../libraries/WorkoPayment.library";

// Import models
import { DbAgencyCvRechargeOrderDto } from "../db/gcp-firestore-models/AgencyCvRechargeOrder.model";
import { DbAgencyCvRechargePackageDto } from "../db/gcp-firestore-models/AgencyCvRechargePackage.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyCvWalletDto } from "../db/gcp-firestore-models/AgencyCvWallet.model";
import { DbAgencyCvCreditTransactionDto } from "../db/gcp-firestore-models/AgencyCvCreditTransaction.model";

// Import services
import { agencyCvRechargePackageServiceObj } from "./AgencyCvRechargePackage.service";
import { agencyUserServiceObj } from "./AgencyUser.service";
import UlidService from "./Ulid.service";
import { agencyCvCreditTransactionServiceObj } from "./AgencyCvCreditTransaction.service";
import { agencyCvWalletServiceObj } from "./AgencyCvWallet.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvRechargeOrderService {
  async performCreateAgencyCvRechargeOrderActivities(
    reqBody: AgencyCvRechargeOrderCreateApiDto,
  ) {
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId,
      );
    if (!agencyUserDetails) {
      global.logger.error("Agency User not found.", {
        reqBody,
        agencyUserDetails,
      });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }
    const { id: agencyUserId, email: agencyRegisteredEmail } =
      agencyUserDetails;

    const { paymentGatewayProvider, agencyCvRechargePackageId } = reqBody;

    /**
     * Read package
     */
    const existingAgencyCvRechargePackage:
      | DbAgencyCvRechargePackageDto
      | undefined =
      await agencyCvRechargePackageServiceObj.getAgencyCvRechargePackageById(
        agencyCvRechargePackageId,
      );
    if (!existingAgencyCvRechargePackage) {
      global.logger.error("Selected Package Details Not Found.", {
        reqBody,
      });
      throw new BaseError(
        "Selected Package Details Not Found.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }

    /**
     * Create Razorpay order
     */
    const razorpayOrder: Orders.RazorpayOrder =
      await workoPaymentLibraryObj.createOrder(
        existingAgencyCvRechargePackage.totalAmount,
        {
          agencyCvRechargePackageId: existingAgencyCvRechargePackage.id,
        },
        paymentGatewayProvider,
      );
    const { status } = razorpayOrder;

    /**
     * Save order in DB with created status
     */
    const date: string = dateHelperObj.getISODate();
    const createDto: DbAgencyCvRechargeOrderDto = {
      id: UlidService.getUlidId(),
      createdAt: date,
      updatedAt: date,
      agencyUserId,
      agencyRegisteredEmail,
      agencyCvRechargePackageId: existingAgencyCvRechargePackage.id,
      cvCount: existingAgencyCvRechargePackage.totalCvCount,
      amount: existingAgencyCvRechargePackage.totalAmount,
      paymentGatewayProvider: paymentGatewayProvider,
      paymentGatewayOrderId: razorpayOrder.id,
      paymentGatewayOrderStatus: status as RazorpayPaymentOrderStatusEnum,
      paymentGatewayCreatedOrderDetails: razorpayOrder,
    };

    return this.createAgencyCvRechargeOrder(createDto);
  }

  async createAgencyCvRechargeOrder(createDto: DbAgencyCvRechargeOrderDto) {
    return agencyCvRechargeOrderDao.createAgencyCvRechargeOrder(createDto);
  }

  async getAgencyCvRechargeOrderByAgencyUserIdAndPgOrderId(
    agencyUserId: string,
    patmentGatewayOrderId: string,
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
   return agencyCvRechargeOrderDao.getAgencyCvRechargeOrderByAgencyUserIdAndPgOrderId(agencyUserId, patmentGatewayOrderId);
  }

  async updateAgencyCvRechargeOrderById(
    id: string,
    updateDto: Partial<DbAgencyCvRechargeOrderDto>,
  ): Promise<DbAgencyCvRechargeOrderDto | undefined> {
    return agencyCvRechargeOrderDao.updateAgencyCvRechargeOrderById(id, updateDto);
  }

  /*
   1. Fetch order from DB
   2. If DB order already PAID → return success
   3. Verify Razorpay signature
   4. (Optional) Fetch Razorpay order
   5. Ensure Razorpay order status === paid
   6. Mark DB order PAID
   7. Credit wallet
   8. Create credit transaction
   */
  async performVerifyPaymentAgencyCvRechargeOrderActivities(
    reqBody: AgencyCvRechargeOrderVerifyPaymentApiDto,
  ) {
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId,
      );
    if (!agencyUserDetails) {
      global.logger.error("Agency User not found.", {
        reqBody,
        agencyUserDetails,
      });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }
    const { id: agencyUserId, email: agencyRegisteredEmail } =
      agencyUserDetails;

    const { paymentGatewayProvider, paymentGatewayVerificationDetails } = reqBody;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentGatewayVerificationDetails;

    /**
     * Fetch order from DB
     */
    const existingAgencyCvRechargeOrder: QuerySnapshot<DocumentData, DocumentData> =
      await this.getAgencyCvRechargeOrderByAgencyUserIdAndPgOrderId(
        agencyUserId,
        razorpay_order_id,
      );
    if (existingAgencyCvRechargeOrder.empty) {
      global.logger.error("Selected Order Details Not Found.", {
        reqBody,
      });
      throw new BaseError(
        "Selected Order Details Not Found.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }
    
    const dbOrder = existingAgencyCvRechargeOrder.docs[0].data() as DbAgencyCvRechargeOrderDto;

    if(dbOrder.paymentGatewayOrderStatus === RazorpayPaymentOrderStatusEnum.PAID) {
      global.logger.error("Order already PAID.", {
        reqBody,
      });
      throw new BaseError(
        "Order already PAID.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }

    const verifyPaymentSignature: boolean = await workoPaymentLibraryObj.verifyPaymentSignature(
      paymentGatewayProvider,
      {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
      }
    );
    if(!verifyPaymentSignature) {
      global.logger.error("Payment Signature verification failed.", {
        reqBody,
      });
      throw new BaseError(
        "Payment Signature verification failed.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }

    const razorpayOrder: Orders.RazorpayOrder = await workoPaymentLibraryObj.fetchOrder(
      paymentGatewayProvider,
      razorpay_order_id
   );
    if(razorpayOrder.status !== RazorpayPaymentOrderStatusEnum.PAID) {
      global.logger.error("Razorpay order status is not PAID.", {
        reqBody,
      });
      throw new BaseError(
        "Razorpay order status is not PAID.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }

    let createOrUpdateAgencyPromise: Promise<DbAgencyCvWalletDto | undefined>;
    const existingAgencyCvWallet: DbAgencyCvWalletDto | undefined = await agencyCvWalletServiceObj.getAgencyCvWalletById(agencyUserId);
    if(existingAgencyCvWallet) {
       createOrUpdateAgencyPromise = agencyCvWalletServiceObj.updateAgencyCvWalletById(
         agencyUserId,
         {
           totalAvailableCvCount: existingAgencyCvWallet.totalAvailableCvCount + dbOrder.cvCount,
           totalAmountPaid: existingAgencyCvWallet.totalAmountPaid + dbOrder.amount,
           lastRechargeDate: dateHelperObj.getISODate(),
           totalRecharges: existingAgencyCvWallet.totalRecharges + 1,
           updatedByAgencyUserId: agencyUserId
         }
       );
    } else {
       createOrUpdateAgencyPromise = agencyCvWalletServiceObj.createAgencyCvWallet({
         agencyUserId,
         agencyRegisteredEmail,
         totalAvailableCvCount: dbOrder.cvCount,
         totalUsedCvCount: 0,
         totalAmountPaid: dbOrder.amount,
         lastRechargeDate: dateHelperObj.getISODate(),
         totalRecharges: 1,
       });
    }

    const updatedAt: string = dateHelperObj.getISODate();
    const successDbActions: [DbAgencyCvRechargeOrderDto | undefined, DbAgencyCvCreditTransactionDto | undefined, DbAgencyCvWalletDto | undefined] = await Promise.all([
      this.updateAgencyCvRechargeOrderById(
        dbOrder.id,
        {
          updatedAt,
          updatedByAgencyUserId: agencyUserId,
          paymentGatewayOrderStatus: RazorpayPaymentOrderStatusEnum.PAID,
          paymentGatewayUpdatedOrderDetails: razorpayOrder,
          paymentId: razorpay_payment_id,
          paymentGatewayVerificationDetails
        },
      ),
      agencyCvCreditTransactionServiceObj.createAgencyCvCreditTransaction({
         agencyCvRechargeOrderId: dbOrder.id,
         amount: dbOrder.amount,
         cvCount: dbOrder.cvCount,
         agencyUserId,
         agencyRegisteredEmail
      }),
      createOrUpdateAgencyPromise,
    ]);

    if(!successDbActions[0] || !successDbActions[1] || !successDbActions[2]) {
      global.logger.error("Failed to update Agency Cv Recharge Order.", {
        reqBody,
      });
      throw new BaseError(
        "Failed to update Agency Cv Recharge Order.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }

    return successDbActions[0];
  }
}

const agencyCvRechargeOrderServiceObj = new AgencyCvRechargeOrderService();
export { agencyCvRechargeOrderServiceObj, AgencyCvRechargeOrderService };