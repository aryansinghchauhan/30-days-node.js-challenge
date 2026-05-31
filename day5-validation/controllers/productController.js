let products = [
  { id: 1, name: 'Wireless Mouse',    category: 'electronics', price: 799,  inStock: true,  createdAt: new Date('2026-01-01').toISOString() },
  { id: 2, name: 'Mechanical Keyboard',category: 'electronics', price: 2499, inStock: true,  createdAt: new Date('2026-01-02').toISOString() },
  { id: 3, name: 'Running Shoes',     category: 'footwear',    price: 3999, inStock: false, createdAt: new Date('2026-01-03').toISOString() },
  { id: 4, name: 'Desk Lamp',         category: 'furniture',   price: 1299, inStock: true,  createdAt: new Date('2026-01-04').toISOString() },
  { id: 5, name: 'Water Bottle',      category: 'lifestyle',   price: 499,  inStock: true,  createdAt: new Date('2026-01-05').toISOString() },
  
];
let nextId = 6;

exports.getAll=(req,res)=>{
    let result=[...products];
    const {category,inStock,minPrice,maxPrice,search}=req.query;
    if(category){
        result=result.filter(p=>p.category.toLowerCase()===category.toLowerCase());
    }
    if(inStock!==undefined){
        result=result.filter(p=>p.inStock===(inStock==='true'));
    }
    if(minPrice!==undefined){
        result = result.filter(p =>p.price>=parseFloat(minPrice));
    }

    if(maxPrice!==undefined){
        result=result.filter(p=>p.price<=parseFloat(maxPrice));
    }

    if(search){
        const term = search.toLowerCase();
        result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)||
        p.tags.some(t=> t.includes(term))
        );
    }
    

    
    result.sort((a, b) => {
      if (a[sort] < b[sort]) return order === 'asc' ? -1 : 1;
      if (a[sort] > b[sort]) return order === 'asc' ?  1 : -1;
      return 0;
      });
    
    
    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    res.json({
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
}
exports.getOne = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return next(createError('Product id must be a number', 400, 'INVALID_ID'));
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return next(createError(`Product with id ${id} not found`, 404, 'NOT_FOUND'));
  }

  res.json({ data: product });
};

// POST /v1/products
exports.create = (req, res, next) => {
  const { name, category, price, inStock = true } = req.body;

  // Manual validation (Day 5 we replace this with Zod)
  const errors = [];
  if (!name    || typeof name     !== 'string') errors.push('name is required and must be a string');
  if (!category|| typeof category !== 'string') errors.push('category is required and must be a string');
  if (price === undefined || typeof price !== 'number' || price < 0) errors.push('price is required and must be a non-negative number');

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400, 'VALIDATION_ERROR'));
  }

  // Check duplicate name
  const exists = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return next(createError(`Product "${name}" already exists`, 409, 'DUPLICATE'));
  }

  const product = {
    id: nextId++,
    name: name.trim(),
    category: category.trim().toLowerCase(),
    price,
    inStock,
    createdAt: new Date().toISOString()
  };

  products.push(product);

  res
    .status(201)
    .set('Location', `/v1/products/${product.id}`)
    .json({ data: product });
};

// PUT /v1/products/:id  — full replace
exports.replace = (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return next(createError(`Product ${id} not found`, 404, 'NOT_FOUND'));
  }

  const { name, category, price, inStock } = req.body;

  const errors = [];
  if (!name)     errors.push('name is required');
  if (!category) errors.push('category is required');
  if (price === undefined) errors.push('price is required');
  if (inStock === undefined) errors.push('inStock is required');

  if (errors.length > 0) {
    return next(createError(errors.join(', '), 400, 'VALIDATION_ERROR'));
  }

  // PUT replaces everything except id and createdAt
  products[index] = {
    id,
    name: name.trim(),
    category: category.trim().toLowerCase(),
    price,
    inStock,
    createdAt: products[index].createdAt,
    updatedAt: new Date().toISOString()
  };

  res.json({ data: products[index] });
};

// PATCH /v1/products/:id  — partial update
exports.update = (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return next(createError(`Product ${id} not found`, 404, 'NOT_FOUND'));
  }

  const { name, category, price, inStock } = req.body;

  // Only update fields that were actually sent
  if (name     !== undefined) products[index].name     = name.trim();
  if (category !== undefined) products[index].category = category.trim().toLowerCase();
  if (price    !== undefined) products[index].price    = price;
  if (inStock  !== undefined) products[index].inStock  = inStock;

  products[index].updatedAt = new Date().toISOString();

  res.json({ data: products[index] });
};

// DELETE /v1/products/:id
exports.remove = (req, res, next) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return next(createError(`Product ${id} not found`, 404, 'NOT_FOUND'));
  }

  products.splice(index, 1);
  res.status(204).end();
};

// GET /v1/products/categories  — bonus: get unique categories
exports.getCategories = (req, res) => {
  const categories = [...new Set(products.map(p => p.category))].sort();
  res.json({ data: categories });
};


