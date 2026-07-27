-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "estimatedTime" TIMESTAMP(3),
ADD COLUMN     "slaDeadline" TIMESTAMP(3);
