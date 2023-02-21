// const fs = require("fs");
import fs from "fs";
import postgres from "postgres";
import { refine } from "./refine_object.js";
import axios from "axios";
import recon_result from "./recons.js";

import XLSX from "xlsx";

const sql = postgres(
  "postgres://postgres:hynodb321@tsbpass-prod-1108.cyhkueygisxj.ap-southeast-1.rds.amazonaws.com:5432/prod_tsbpass",
  {
    host: "tsbpass-prod-1108.cyhkueygisxj.ap-southeast-1.rds.amazonaws.com", // Postgres ip address[es] or domain name[s]
    port: 5432, // Postgres server port[s]
    database: "prod_tsbpass", // Name of database to connect to
    username: "postgres", // Username of database user
    password: "hynodb321", // Password of database user
    ssl: false, // true, prefer, require, tls.connect options
    max: 10, // Max number of connections
    max_lifetime: null, // Max lifetime in seconds (more info below)
    idle_timeout: 0, // Idle connection timeout in seconds
    connect_timeout: 30, // Connect timeout in seconds
    prepare: true, // Automatic creation of prepared statements
  }
);

async function main() {
  // let rejected = [];
  // let completed = [];
  // let prod_connection = await prod;
  // let new_connection = await new_con;
  // let getRows = (query) => new Promise((res, rej) => {
  // 	prod_connection.query(query, function (error, results, fields) {
  // 		if (error) rej(error);
  // 		if (results) {
  // 			res(results);
  // 		}
  // 	});
  // });
  // let putRows = (query,params) => new Promise((res, rej) => {
  // 	new_connection.query(query, params, function (error, results, fields) {
  // 		if (error) rej(error);
  // 		if (results) {
  // 			res(results);
  // 		}
  // 	});
  // });

  // let offset = 0;
  // let limit = 100;
  // while(1) {
  // 	let getQuery = `SELECT * FROM u294228523_4Ubag.e20q_file_chunk limit ${limit} offset ${offset}`;

  // 	let data = await getRows(getQuery).catch(error => {
  // 		console.log(error);
  // 		return null;
  // 	});
  // if (data === null || data.length === 0) {
  // 	console.log("Done...");
  // 	break;
  // }
  // let putQuery = 'INSERT INTO u294228523_4Ubag_new.e20q_file_chunk VALUES (?,?,?)';
  // let promises = [];
  // for (let i = 0; i < data.length; i++) {
  // 	let file_id = data[i].file_id;
  // 	let chunk_id = data[i].chunk_id;
  // 	let filedata = Buffer.from(data[i].filedata);
  // 	promises.push(putRows(putQuery, [file_id, chunk_id, filedata]).then((result) => {
  // 		completed.push({file_id, chunk_id});
  // 		console.log("Insert Success    ->", file_id, chunk_id, 'Affected Rows: ', result.affectedRows, 'warningCount: ', result.warningCount);
  // 	}).catch((error) => {
  // 		rejected.push({file_id, chunk_id});
  // 		console.log("Insert Failed   ->", file_id, chunk_id, error);
  // 	}));
  // }
  // await Promise.all(promises);
  // console.log("Completed Rows -> ",offset + limit);
  // console.log("Records Length -> ",data.length);
  // offset += limit;
  // if (offset === 6000) {
  // 	console.log("Done...");
  // 	break;
  // }
  // }
  // console.log()
  // prod_connection.end();
  // new_connection.end();
  //   let application_id = [257415, 264970,  ];
  //   264970;
  //   257415;

  //   Take application_ids from command line arguments as comma separated values and convert them to array of integers
  let application_ids = process.argv[2].split(",").map((id) => parseInt(id));
  //   Call the fetchApplicationResult function for each application_id
  for (let i = 0; i < application_ids.length; i++) {
    await fetchApplicationResult(application_ids[i]);
    console.log("Done: ", application_ids[i]);
  }
  process.exit(0);
}

async function fetchApplicationResult(application_id) {
  const application = await sql`
	SELECT row_to_json(t)
FROM (
  SELECT a.application_identifier,
         a.property_id,
         a.id as application_id,
         p.total_built_up_area as total_builtup_area,
         p.plot_area_as_per_document as plotareasqmts,
         p.net_plot_area as net_plot_area,
         a.approval_for as permissiontype,
		 fba.units as units,
         bt.purpose_of_building as buildingusage,
		 bt.building_subcategory as buildingsubusage,
         l.district_administration_area as authority,
         l.ulb_grade as typeofmnc,
	     l.ulb_name as nameofmnc,
         (
           select answer
           from application_answers
           where application_id = a.id
           and application_question_id = 17
           and answer in ('Open Plot or Piece of Land', 'Part Of Survey Number', 'Unapproved Layout','Construction Prior to 1-1-1985', 'Gramakantam/Abadi')
         ) as plotispartof,
		(
           select answer
           from application_answers
           where application_id = a.id
           and application_question_id = 450
         ) as fallsundersliproad,
		(
           select answer
           from application_answers
           where application_id = a.id
           and application_question_id = 451
         ) as sliproaddistance,
		(
           select answer
           from application_answers
           where application_id = a.id
           and application_question_id = 3
         ) as vltpaid,
		(
           select answer
           from application_answers
           where application_id = a.id
           and application_question_id = 52
         ) as subdivded
  FROM applications a
  INNER JOIN properties p ON a.property_id = p.id
  INNER JOIN locations l ON p.location_id = l.id
  INNER JOIN floor_builtup_areas fba ON fba.property_id = a.property_id
  INNER JOIN building_types bt ON bt.id = p.building_type_id
  INNER JOIN fee_details ON a.id = fee_details.application_id
  WHERE 
-- 	l.district_administration_area='GHMC'
--   AND 
-- 	bt.purpose_of_building not in ('Residential')
-- 	a.application_identifier IS NOT NULL
-- 	fba.units is not null
--   AND 
    a.id = ${application_id}
--   AND l.ulb_grade IN (1,2,3)
--   AND 
-- 	fee_details.fee_breakup IS NOT NULL 
) t;
		`;
  //   console.log(application[0].row_to_json);
  const obj = application[0].row_to_json;
  let application_obj = {
    authority: "",
    typeofmnc: "",
    permissiontype: "",
    fallsundersliproad: "",
    sliproaddistance: 0,
    fallsundercrmp: "",
    crmpdistance: 1,
    crmpcategory: "",
    system: "",
    buildingusage: "",
    specialzone: "",
    buildingsubusage: "",
    units: null,
    plotispartof: "",
    issitevacant: "",
    vltpaid: "",
    subdivded: "No",
    nameofmnc: "",
    height: 0,
    if_land_provided_for_hmda: "",
    buildingtype: "",
    plotareasqmts: 0,
    net_plot_area: 0,
    total_builtup_area: 0,
    amentiesbuiltuparea: 0,
    compound_wall_length: 0,
    vacant_plot_area: 0,
    ...obj,
  };
  let refined_obj = refine(application_obj);
  console.log(refined_obj);
  const payload = {
    ...refined_obj,
  };

  const fee_engine_result = await axios
    .post("http://localhost:3001/dev/calculate", payload)
    .then((response) => {
      return response.data.data;
    })
    .catch((error) => {
      console.error(error);
    });
  // console.log(result.data);
  const recon =
    await sql`select * from public.fee_details where application_id=${application_id}`;
  console.log(fee_engine_result, recon[0]);
  const prod_result = recon[0].fee_breakup
    ? recon[0].fee_breakup
    : recon[0].calculated_fee_breakup;
  // console.log(recon_result(result.data, recon[0].fee_breakup).filter(ele => ele));
  let results = recon_result(fee_engine_result, prod_result)
    .filter((ele) => ele)
    .map((element) => {
      let fee_head = element.fee_head;
      let engine_index = fee_engine_result.findIndex(function (result) {
        return result.fee_head_name == fee_head;
      });
      let fee_service_rate = fee_engine_result[engine_index].rate;
      let is_rate_present =
        fee_engine_result[engine_index].matched_rates_count === 1
          ? "Yes"
          : "No";
      return {
        request_body: refined_obj,
        application_id,
        fee_head,
        fee_engine_amount: element.engine,
        database_amount: element.prod.amount,
        fee_service_rate, // need update in the Engine
        is_rate_present, // need update in the Engine
        is_amount_matching: element.is_matched,
        prod_result: recon[0].fee_breakup,
        fee_engine_result: fee_engine_result,
        prod_db_application_obj: application[0].row_to_json,
        fee_engine_matched_rates_count:
          fee_engine_result[engine_index].matched_rates_count, //need update in the Engine
      };
    });
  //   console.log(results);

  // [
  // 	{
  // 	  fee_head: 'betterment charges',
  // 	  is_matched: true,
  // 	  engine: 0,
  // 	  prod: { amount: 0, newAmount: 0 }
  // 	},
  // 	undefined,
  // 	undefined,
  // 	{
  // 	  fee_head: 'building permit fee proposed builtup area',
  // 	  is_matched: false,
  // 	  engine: 1600.6,
  // 	  prod: { amount: 7488.15, newAmount: 7488.15 }
  // 	},
  // ]
  // create a new excel sheet using XLSX npm package that I've created with the above provided result array and create a new sheet only if the fee_head Object sheet is not present in the xlsx file, if the sheet is present then append the result to the sheet and name the sheet as fee_head name.

  // Create a new workbook
  const workbook = "Automated_feehead_report.xlsx";

  //   check if workbook file exists then load workbook else create a new workbook
  if (fs.existsSync(workbook)) {
    var wb = XLSX.readFile(workbook);
  } else {
    var wb = XLSX.utils.book_new();
  }

  // Write a for loop to iterate through the result array and create a new sheet for each fee_head name if the characters are more thn 31 then truncate the characters to 31
  for (let i = 0; i < results.length; i++) {
    const sheet_name =
      results[i].fee_head.length > 31
        ? results[i].fee_head.substring(0, 31)
        : results[i].fee_head;

    // If the value of the field is Json object then Strigify and append to the sheet
    // If the value of the field is Json array then Strigify and append to the sheet
    if (
      typeof results[i].request_body === "object" &&
      results[i].request_body !== null
    ) {
      results[i].request_body = JSON.stringify(results[i].request_body);
    }

    if (
      typeof results[i].prod_result === "object" &&
      results[i].prod_result !== null
    ) {
      results[i].prod_result = JSON.stringify(results[i].prod_result);
    }

    if (
      typeof results[i].fee_engine_result === "object" &&
      results[i].fee_engine_result !== null
    ) {
      results[i].fee_engine_result = JSON.stringify(
        results[i].fee_engine_result
      );
    }

    if (
      typeof results[i].prod_db_application_obj === "object" &&
      results[i].prod_db_application_obj !== null
    ) {
      results[i].prod_db_application_obj = JSON.stringify(
        results[i].prod_db_application_obj
      );
    }

    // // Check if the sheet is present in the xlsx file
    // if (wb.SheetNames.includes(sheet_name)) {
    // 	// Append the new data to the existing sheet

    // 	const ws = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name]);
    // 	// Convert the array of objects to array of arrays and then append the new data to the existing sheet

    // 	ws.push(Object.values(results[i]));
    // 	const new_ws = XLSX.utils.aoa_to_sheet(ws);
    // 	wb.Sheets[sheet_name] = new_ws;
    // } else {
    // 	// Create a new sheet if the sheet is not present in the xlsx file
    // 	const ws = XLSX.utils.json_to_sheet([results[i]]);
    // 	wb.SheetNames.push(sheet_name);
    // 	wb.Sheets[sheet_name] = ws;
    // }

    // check if sheet present with sheetname in the workbook. if exits then append the data to the sheet else create a new sheet and append
    if (wb.SheetNames.includes(sheet_name)) {
      // Append the new data to the existing sheet
      const ws = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name]);
      ws.push(results[i]);
      // filter out duplicates by application_id
      const unique = ws.filter(
        (v, i, a) =>
          a.findIndex((t) => t.application_id === v.application_id) === i
      );
      const new_ws = XLSX.utils.json_to_sheet(unique);
      wb.Sheets[sheet_name] = new_ws;
    } else {
      // Create a new sheet if the sheet is not present in the xlsx file
      const ws = XLSX.utils.json_to_sheet([results[i]]);
      wb.SheetNames.push(sheet_name);
      wb.Sheets[sheet_name] = ws;
    }
  }

  XLSX.writeFile(wb, "Automated_feehead_report.xlsx");
}

main();
