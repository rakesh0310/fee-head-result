import { FeeHeads } from "./fee_heads.js";
export default (fee_engine_result, prod_result) => {
    const compare = (fee_engine_obj, prod_object) => {
        if (fee_engine_obj && prod_object) {
            let is_matched = fee_engine_obj.amount.toFixed(2) === prod_object.amount.toFixed(2);
            return {
                fee_head: fee_engine_obj.fee_head_name,
                is_matched,
                engine: fee_engine_obj.amount,
                prod: {
                    amount: prod_object.amount,
                    newAmount: prod_object.newAmount
                }
            };
        }
    }
    let prod_fee_heads = Object.keys(FeeHeads);
    let results = [];
    prod_fee_heads.forEach(fee_head => {
        let prod_index = prod_result.findIndex(function(result) {
            return result.cost_head_name == fee_head;
        });
        let engine_index = fee_engine_result.findIndex(function(result) {
            return result.fee_head_name == FeeHeads[fee_head]
          });
        
        results.push(compare(fee_engine_result[engine_index], prod_result[prod_index]));
    });
    return results;
}

