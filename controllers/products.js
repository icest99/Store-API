const Product = require('../models/product');
// const { options } = require('../routes/products');

const getAllProductsStatic = async (req, res) => {
    const products = await Product.find({}).sort('-name price');
    res.status(200).json({ products, nbHits: products.length });
};

const getAllProducts = async (req, res) => {
    const { featured, company, name, sort, field, numbericFilters } = req.query;
    const queryObject = {}

    if (featured) {
        queryObject.featured = featured === 'true'? true : false;
    }
    if (company) {
        queryObject.company = company;
    }
    if (name) {
        queryObject.name = { $regex: name, $options: '1'};
    }
    if (field) {
        queryObject.field = field;
    }
    if (numbericFilters) {
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
        }
        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        //if there's a match, swap the value key
        //from query '>' it will be '$gt'
        let filters = numbericFilters.replace(regEx, (match)=> `-${operatorMap[match]}-`)
        const options = ['price', 'rating']
        filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]: Number(value)}}
            })
        }
        // queryObject.field = numbericFilters;

    //no 'await' before Product.find because we want to chain other mongo functions like sort to it. since 'await' will return the document
    console.log(queryObject)
    let result = Product.find(queryObject);
    if (sort) {
        //if use pass the multiple sort condition, it will look like 'name,-price', which is not useable, we need 'name -price' to work with sort function
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    } else {
        result = result.sort('crateAt')
    }

    //select
    if (field) {
        //if use pass the multiple sort condition, it will look like 'name,-price', which is not useable, we need 'name -price' to work with sort function
        const fieldList = field.split(',').join(' ')
        result = result.select(fieldList)
    }

    //pagination
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit)

    const products = await result
    res.status(200).json({ products, nbHits: products.length })
};

module.exports = {
    getAllProducts,
    getAllProductsStatic
}
