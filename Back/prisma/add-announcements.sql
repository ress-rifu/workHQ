-- Add Announcement table
CREATE TABLE IF NOT EXISTS "Announcement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "priority" TEXT DEFAULT 'NORMAL' CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "Announcement_isActive_createdAt_idx" ON "Announcement"("isActive", "createdAt" DESC);
CREATE INDEX "Announcement_createdBy_idx" ON "Announcement"("createdBy");
