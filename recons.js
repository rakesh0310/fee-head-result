import { FeeHeads } from "./fee_heads.js";
export default (fee_engine_result, prod_result) => {
    const compare = (fee_engine_obj, prod_object, fee_head) => {
        if (fee_engine_obj && prod_object) {
            let is_matched = fee_engine_obj.amount === prod_object.amount;
            return {
                fee_head,
                is_matched,
                engine: fee_engine_obj.amount,
                prod: {
                    amount: prod_object.amount,
                    newAmount: prod_object.newAmount
                }
            };
        }
    }
    let fee_heads = Object.keys(FeeHeads);
    let results = [];
    fee_heads.forEach(fee_head => {
        let engine_index = fee_engine_result.findIndex(function(result) {
            return result.fee_head_name == fee_head
          });
        let prod_index = prod_result.findIndex(function(result) {
            return result.cost_head_name == FeeHeads[fee_head];
        });
        results.push(compare(fee_engine_result[engine_index], prod_result[prod_index], fee_head));
    });
    return results;
}

