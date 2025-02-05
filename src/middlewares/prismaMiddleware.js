// const { PrismaClient } = require("@prisma/client");
// const { broadcast } = require("../utils/sseConnections");
// const { convertStringToSeconds, convertSecondsToString } = require("../utils/calculateTime");
// const { getUpdatedFlowerImage } = require("../utils/updateFlowerImage");

// // Prisma Middleware 설정
// const prisma = new PrismaClient().$extends({
//     query: {
//         focusTime: {
//             async update({ args, query }) {
//                 console.log("📝 Prisma Client Extension 동작 확인: update 호출됨");

//                 // 업데이트 실행
//                 const result = await query(args);

//                 // 업데이트된 데이터가 존재하면 브로드캐스트
//                 if (result) {
//                     console.log("📡 브로드캐스트할 데이터:", result);
//                     await broadcast(result);
//                 } else {
//                     console.warn("⚠️ 업데이트된 데이터가 없습니다.");
//                 }

//                 return result;
//             },

//             async create({ args, query }) {
//                 console.log("📝 Prisma Client Extension 동작 확인: create 호출됨");

//                 // 데이터 생성
//                 const result = await query(args);

//                 // 생성된 데이터가 존재하면 브로드캐스트
//                 if (result) {
//                     console.log("📡 새로 생성된 데이터 브로드캐스트:", result);
//                     await broadcast(result);
//                 } else {
//                     console.warn("⚠️ 생성된 데이터가 없습니다.");
//                 }

//                 return result;
//             },

//             async updateMany({ args, query }) {
//                 console.log("📝 Prisma Client Extension: updateMany 감지됨");

//                 const result = await query(args);

//                 if (result.count > 0) {
//                     console.log(`📡 ${result.count}개의 데이터가 업데이트되었습니다.`);
//                 }

//                 return result;
//             }
//         }
//     }
// });

// module.exports = prisma;