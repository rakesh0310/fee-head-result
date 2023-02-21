const typeofmnc = {
    '1':'G1',
    '2':'G2',
    '3':'G3',
    '4':'MCR',  
    '5':'SPG',
    '7':'GWMC',
    // [1,2,3,4,5]:'GHMC', 
    // [1,2,3,4,5]:'HMDA',
    // [1,2,3,4,5]:'DTCP'

}
const permissiontype = {
    'BUILDING':'BP',
}

const buildingusage = {
    'Residential': 'RES',
    'Non Residential': 'NonRes'
}

const buildingsubusage = {
    "Individual Residential Building": "Individual Res",
    "Group Housing":"Group Housing"
}

const plotispartof = {
    'Open Plot or Piece of Land':'PieceofLand',
    'Unapproved Layout':'UnapprovedLayout',
    'Construction Prior to 1-1-1985':'ConstructedPriorto1985',
    'Gramakantam/Abadi':'Gramakhantam/Abadi',
    'Approved LRS':'ApprovedLayout',
    'Approved Building Plan':'Approved Bulding',
    'Building Regularized under BPS':'BPS'
}

const subdivded = {
    'FALSE':'No',
    'TRUE':'Yes'
}

const vltpaid = {
    'FALSE':'NO',
    'TRUE':'YES'
}

const fallsundersliproad = {
    'TRUE':'YES',
    'FALSE':'NO'
}


export const refine = (application) => {
    application.buildingusage = buildingusage[application.buildingusage] || application.buildingusage;
    application.plotispartof = plotispartof[application.plotispartof] || '';
    application.buildingsubusage = buildingsubusage[application.buildingsubusage] || application.buildingsubusage
    application.permissiontype = permissiontype[application.permissiontype] || application.permissiontype
    application.permissiontype = permissiontype[application.permissiontype] || application.permissiontype
    application.typeofmnc = typeofmnc[application.typeofmnc] || application.typeofmnc;
    application.subdivded = subdivded[application.subdivded] || 'No';
    application.vltpaid = vltpaid[application.vltpaid] || '';
    application.fallsundersliproad = fallsundersliproad[application.fallsundersliproad] || '';
    if (application.fallsundersliproad) {
        application.sliproaddistance = parseInt(application.sliproaddistance);
    }
    application.units = application.units ? application.units : 0;
    if (application.authority === 'GHMC') application.typeofmnc = 'GHMC';
    if (application.height === null) application.height = 0;
    return application;
}