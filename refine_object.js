const typeofmnc = {
    '1':'G1',
    '2':'G2',
    '3':'G3'
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


export const refine = (application) => {
    application.buildingusage = buildingusage[application.buildingusage] || application.buildingusage;
    application.plotispartof = plotispartof[application.plotispartof] || '';
    application.buildingsubusage = buildingsubusage[application.buildingsubusage] || application.buildingsubusage
    application.permissiontype = permissiontype[application.permissiontype] || application.permissiontype
    application.permissiontype = permissiontype[application.permissiontype] || application.permissiontype
    application.typeofmnc = typeofmnc[application.typeofmnc] || application.typeofmnc;
    if (application.authority === 'GHMC') application.typeofmnc = 'GHMC';
    if (application.height === null) application.height = 0;
    return application;
}