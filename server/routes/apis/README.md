# API options

## Products

### Get all products
To get all products, use `/api/products`.

### Find by id
To find a specific product by it id, use `/api/products?id=[THE ID]`.

### Filter products
You can filter the list of products using any combination of optional filters.
- `brand`: The brand of the product.
- `flavor`: The flavor of the product.
- `species`: The target species for the product (e.g., cat or dog).
- `lifeStage`: The life stage of the pet (e.g., adult, young, all).
- `foodType`: The type of food (e.g., dry or wet).

You can use any combination of filters. For example `/api/products?brand=Purina&species=cat`

### Add a product