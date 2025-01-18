const { Prisma } = require("@prisma/client");

// errorHandler.js
// app.js 에러 핸들러로 모든 라우트 관리
// 필요에 따라 에러 처리 추가
// 커스텀 에러가 아닌 에러에 대한 추가 필요!
const errorMiddleware = (err, req, res, next) => {
  try{
    console.error(err);

    if (err instanceof CustomError) {
      return res.status(err.code).json({
        message: err.message,
      });
    }

    if (err.name == "StructError") {
      return res.status(400).json({
        message: err.message.split('--')[1].trim()
      });
    }

    // Prisma의 Known Request Error 처리
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // 에러 코드에 따라 분기 처리
      switch (err.code) {
        case "P2002":
          // 고유 제약 조건 위반 (중복된 값)
          return res.status(ErrorCodes.Conflict.code).json({
            message: ErrorCodes.Conflict.message,
            errormeta: err.meta || null, // err.meta가 존재하면 반환, 없으면 null
          });
        case "P2025":
          // 레코드를 찾을 수 없음
          return res.status(ErrorCodes.NotFound.code).json({
            message: ErrorCodes.NotFound.message,
            errormeta: err.meta || null, // err.meta가 존재하면 반환, 없으면 null
          });
        // 다른 에러 코드에 대한 처리 추가 가능
        default:
          return res.status(ErrorCodes.BadRequest.code).json({
            message: err.message,
            errormeta: err.meta || null, // err.meta가 존재하면 반환, 없으면 null
          });
      }
    }

    // Prisma의 Validation Error 처리
    if (err instanceof Prisma.PrismaClientValidationError) {
      return res.status(ErrorCodes.BadRequest.code).json({
        message: "데이터 유효성 검증 오류가 발생했습니다",
      });
    }

    // 예상치 못한 에러의 경우
    return res.status(500).json({
      message: "예상치 못한 오류가 발생했습니다",
    });
  }
  catch {
    // 에러 처리중 예상치 못한 에러의 경우
    return res.status(500).json({
      message: "에러 처리 중 예상치 못한 오류가 발생했습니다",
    });
  }
};

// 사용 예시

// // 기본 메시지 사용
// throw new CustomError(ErrorCodes.BadRequest);

// // 커스텀 메시지 사용
// throw new CustomError(ErrorCodes.NotFound, "사용자를 찾을 수 없습니다.");

module.exports = { errorMiddleware };