const axios = require('axios');
const xml2js = require('xml2js');
const { ErrorCodes, CustomError } = require("../utils/error");
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// REST URL
const url_1 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlowerList01'; //상세1
//const url_2 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlowerView01'; //상세2
const url_3 = 'https://apis.data.go.kr/1390804/NihhsTodayFlowerInfo01/selectTodayFlower01'; //상세3
// 서비스 키 (발급받은 디코딩된 인증키)
const serviceKey = process.env.FLOWER_SERVICE_KEY;

const currentDate = new Date();
 
const getTodayFlower = async (req, res) => {
  const fMonth = req.query.fMonth || (currentDate.getMonth()+1).toString();   //기본값: 현재 날짜
  const fDay = req.query.fDay || currentDate.getDate().toString();
  const queryParams = `?serviceKey=${encodeURIComponent(serviceKey)}&fMonth=${fMonth}&fDay=${fDay}`;

  try {
    const response = await axios.get(url_3 + queryParams);

    return new Promise((resolve, reject) => {
      xml2js.parseString(response.data, (err, result) => {
        if (err) {
          return reject(new CustomError(ErrorCodes.InternalServerError, 'XML 파싱 오류'));
        }

        //console.log('Parsed result:', JSON.stringify(result, null, 2));

        if (!result.document || !result.document.root || !result.document.root[0] || !result.document.root[0].result) {
          return reject(new CustomError(ErrorCodes.BadRequest, '예상치 못한 API 응답 구조'));
        }

        const flowerInfo = result.document.root[0].result[0];
        const flowerData = {
          name: flowerInfo.flowNm[0], 
          language: flowerInfo.flowLang[0], //꽃말
          imageUrl1: flowerInfo.imgUrl1[0],
        };

        resolve(flowerData);
      });
    });
  } catch (error) {
    throw new CustomError(ErrorCodes.InternalServerError, '서버 오류가 발생했습니다.');
  }
};


const searchFlower = async (name) => {
  if (!name) {
    throw new CustomError(ErrorCodes.BadRequest, '꽃 이름을 입력해주세요.');
  }
  
  try {
    const response = await axios.get(url_1, {
      params: {
        serviceKey: serviceKey,
        searchType: '1',
        searchWord: name,
      },
    });

    console.log('API 응답 데이터:', response.data);

    return new Promise((resolve, reject) => {
      xml2js.parseString(response.data, (err, result) => {
        if (err) {
          return reject(new CustomError(ErrorCodes.InternalServerError, 'XML 파싱 오류'));
        }

        if (!result.document || !result.document.root || !result.document.root[0]) {
          return reject(new CustomError(ErrorCodes.InternalServerError, '예상치 못한 API 응답 구조'));
        }

        const root = result.document.root[0];
        const items = root.result;

        if (!items || items.length === 0) {
          return reject(new CustomError(ErrorCodes.NotFound, '검색결과가 없음'));
        }

        const flowerInfo = items.map(item => ({
          name: item.flowNm[0],
          language: item.flowLang[0],
          imageUrl1: item.imgUrl1[0],
          imageUrl2: item.imgUrl2[0],
          imageUrl3: item.imgUrl3[0],
        }));

        resolve(flowerInfo);
      });
    });
  } catch (error) {
    throw new CustomError(ErrorCodes.InternalServerError, '서버 오류가 발생했습니다.');
  }
};

const getUnlockedFlowers = async (req, res) => {
  const userId = req.user.id;

  try {
    const unlockedFlowers = await prisma.memberFlower.findMany({
      where: { 
        memberId: Number(userId),
        unlocked: true 
      },
      include: {
        flower: true  // 꽃 상세 정보 포함
      }
    });

    res.json(unlockedFlowers);
  } catch (error) {
    throw new CustomError(
      ErrorCodes.InternalServerError, 
      '잠금 해제된 꽃 목록 조회 중 오류가 발생했습니다.'
    );
  }
};

module.exports = {
  getTodayFlower,
  searchFlower,
  getUnlockedFlowers,
};