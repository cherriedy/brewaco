import { CancelExpiredPaymentsService } from "#common/services/payment/cancel-expired-payments.service.js";
import logger from "#common/utils/logger.js";

export class PaymentCleanupJob {
  private cancelExpiredPaymentsService: CancelExpiredPaymentsService;

  constructor() {
    this.cancelExpiredPaymentsService = new CancelExpiredPaymentsService();
  }

  async execute(): Promise<void> {
    try {
      logger.info("Starting payment cleanup job...");

      const canceledCount = await this.cancelExpiredPaymentsService.execute();

      logger.info(
        `Payment cleanup job completed. Cancelled ${canceledCount} expired orders.`,
      );
    } catch (error) {
      logger.error("Error in payment cleanup job:", error);
      throw error;
    }
  }

  /**
   * Starts the cleanup job on a schedule
   * @param intervalHours - How often to run the job (in hours)
   */
  start(intervalHours = 1): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    // Run immediately on start
    this.execute().catch((err) => {
      logger.error("Initial payment cleanup job failed:", err);
    });

    // Then run on schedule
    setInterval(() => {
      this.execute().catch((err) => {
        logger.error("Scheduled payment cleanup job failed:", err);
      });
    }, intervalMs);

    logger.info(
      `Payment cleanup job scheduled to run every ${intervalHours} hour(s)`,
    );
  }
}

// Export singleton instance
export const paymentCleanupJob = new PaymentCleanupJob();
