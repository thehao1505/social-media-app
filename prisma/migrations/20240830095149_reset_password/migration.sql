-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordConfirm" TEXT,
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "passwordResetTokenExpiry" TIMESTAMP(3);
