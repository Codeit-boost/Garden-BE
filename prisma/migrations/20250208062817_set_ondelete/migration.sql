-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_memberId_fkey";

-- DropForeignKey
ALTER TABLE "FocusTime" DROP CONSTRAINT "FocusTime_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberFlower" DROP CONSTRAINT "MemberFlower_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberFriend" DROP CONSTRAINT "MemberFriend_friendId_fkey";

-- DropForeignKey
ALTER TABLE "MemberFriend" DROP CONSTRAINT "MemberFriend_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberMission" DROP CONSTRAINT "MemberMission_memberId_fkey";

-- DropForeignKey
ALTER TABLE "MemberMission" DROP CONSTRAINT "MemberMission_missionId_fkey";

-- AddForeignKey
ALTER TABLE "MemberFriend" ADD CONSTRAINT "MemberFriend_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFriend" ADD CONSTRAINT "MemberFriend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFlower" ADD CONSTRAINT "MemberFlower_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberMission" ADD CONSTRAINT "MemberMission_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberMission" ADD CONSTRAINT "MemberMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusTime" ADD CONSTRAINT "FocusTime_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
