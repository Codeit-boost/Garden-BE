const { parseStringPromise } = require('xml2js');
const { ErrorCodes, CustomError } = require("./error");


const parseXml = async(xml) => {
    try{
        const result = await parseStringPromise(xml);
        return result
    }catch(error){
        throw new CustomError(ErrorCodes.InternalServerError, 'XML 파싱 오류');
    }
};

module.exports = { parseXml };