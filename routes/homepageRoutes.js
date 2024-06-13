const express = require("express");
const mongoose = require('mongoose');
const multer = require('multer');
const router = express();
const {storage} = require('../cloudinary');
const upload = multer({ storage });
const {uploader} = require('cloudinary').v2;
const { isLoggedin } = require('../middleware/index');
const wrapAsync = require('../utils/Wrapasync');
const clothingCategory = mongoose.model('clothingCategory');
const Product = mongoose.model('Product');
const Navbar = mongoose.model('Navbar');
//---------------- Category Get Route
router.get("/admin/category", isLoggedin, wrapAsync( async (req, res) => {
    const categories = await clothingCategory.find({});
    res.render('./admin/index', { categories }); // Pass 'navbars' to the view
}));
//---------------- Category Post Route
router.post('/admin/category', isLoggedin,wrapAsync( async (req, res) => {
  const { category } = req.body;

  
    const cat = new clothingCategory({ name: category });
    const savedCategory = await cat.save();


    req.flash('success', 'Category has been added!');
    res.redirect('/admin/category');
  
}));
//---------------- Category get Route by id 
router.get('/admin/category/edit/:id', isLoggedin, wrapAsync( async (req, res) => {
    const { id } = req.params;
    const category = await clothingCategory.findById(id);
    res.render('./admin/editCategory', { category })
}));
//---------------- Category Put Route
router.put('/admin/category/edit/:id',isLoggedin,wrapAsync( async (req, res) => {
    const { id } = req.params;
    const { category } = req.body;
    const cat = await clothingCategory.findByIdAndUpdate(id, { name: category });
    await cat.save();
    req.flash('success', "Category name has been updated!")
    res.redirect('/admin/category');
}));

// Category get route to fetch products inside a category
  router.get('/admin/category/:categoryId/products', isLoggedin, wrapAsync(async (req, res) => {
    
        const { categoryId } = req.params;
        const category = await clothingCategory.findById(categoryId).populate('products');
        if (!category) {
            req.flash('error', 'Category not found!');
            return res.redirect('/admin/category');
        }
         res.render('./admin/productsForCategory', {  products: category.products, category });
}));
// Category Delete Route
router.delete('/admin/category/delete/:id', isLoggedin,wrapAsync( async (req, res) => {
    const { id } = req.params;
    
   
      // Find the category by ID
      const category = await clothingCategory.findById(id).populate('products');
    //   res.send(category)
      if (!category) {
        req.flash('error', 'Category not found!');
        return res.redirect('/admin/category');
      }
  
      if (category.products.length > 0) {
        // Pull all products associated with the category
        await Promise.all(category.products.map(async(product) => {
            await Product.findByIdAndDelete(product._id)
        }))
    }
    await clothingCategory.findByIdAndDelete(id);
  
      req.flash('success', 'Category and its products are deleted!');
      res.redirect('/admin/category');
   
  }));


// Products get Route
router.get("/admin/product", isLoggedin, wrapAsync( async (req, res) => {
   
        const products = await Product.find({});
        const categories = await clothingCategory.find({});
        
        res.render('./admin/product', { products, categories });
 
}));
// Products post route
router.post('/admin/product', isLoggedin, upload.array('images'),  wrapAsync(async (req, res) => {
    
        const {
            itemNumber,
            productTitle,
            productDescription,
            msrp,
            sizes,
            sizeRatio,
            color,
            casePack,
            upc,
            category, 
            inventory,
            isNewArrival,
            isTrending,
        } = req.body;

        const colorsArray = color.split(',').map(color => color.trim());
        const sizesArray = sizes.split(',').map(sizes => sizes.trim());
        const sizeRatioArray = sizeRatio.split(',').map(sizeRatio => sizeRatio.trim());
        const casePackArray = casePack.split(',').map(casePack => casePack.trim());
        const inventoryArray = inventory.split(',').map(inventory => inventory.trim());

         // Check if the number of sizes matches the number of inventory values
    if (sizesArray.length !== inventoryArray.length) {
      req.flash('error', 'Number of sizes must match the number of inventory values');
      return res.redirect('/admin/product');
  }

        const cat = await clothingCategory.findById(category);

         const isNewArrivalBool = isNewArrival === 'true';
         const isTrendingBool = isTrending === 'true';

        const categoryId = mongoose.Types.ObjectId.createFromHexString(category);
        const selectedCategory = await clothingCategory.findById(categoryId);
        if (!selectedCategory) {
            throw new Error('Invalid category ID');
        }
        const product = new Product({
            itemNumber,
            productTitle,
            productDescription,
            msrp,
            images: req.files.map(file => ({
                filename: file.filename,
                path: file.path
            })),
            sizes: sizesArray, 
            sizeRatio: sizeRatioArray,
            color: colorsArray,
            casePack: casePackArray,
            upc: parseInt(upc),
             category: selectedCategory.name, 
            inventory: inventoryArray,
            isNewArrival: isNewArrivalBool,
            isTrending: isTrendingBool,
        });
        cat.products.push(product._id);
        await cat.save();
         await product.save();
         req.flash('success', 'Product has been added!');
         res.redirect('/admin/product');
   
}));
// Get route to get product by id 
router.get('/admin/product/edit/:id',isLoggedin, wrapAsync(  async (req, res, next) => {
    
        const { id } = req.params;
        const product = await Product.findById(id);
        const categories = await clothingCategory.find({}); // Retrieve categories from the database

        res.render('./admin/editProduct', { product, categories }); // Pass 'categories' to the view
    
}));
// Product put route 
router.put('/admin/product/edit/:id', isLoggedin, upload.array('images'), wrapAsync( async (req, res) => {
   
      const { id } = req.params;
      const {
        itemNumber,
        productTitle,
        productDescription,
        msrp,
        sizes,
        sizeRatio,
        color,
        casePack,
        upc,
        category,
        inventory,
        isNewArrival,
        isTrending,
      } = req.body;
  
      
      const colorsArray = color.split(',').map(color => color.trim());
      const sizesArray = sizes.split(',').map(sizes => sizes.trim());
      const sizeRatioArray = sizeRatio.split(',').map(sizeRatio => sizeRatio.trim());
      const casePackArray = casePack.split(',').map(casePack => casePack.trim());
      const inventoryArray = inventory.split(',').map(inventory => inventory.trim());
       // Check if the number of sizes matches the number of inventory values
    if (sizesArray.length !== inventoryArray.length) {
      req.flash('error', 'Number of sizes must match the number of inventory values');
      return res.redirect('/admin/product');
  }
  
      const isNewArrivalBool = isNewArrival === 'true';
      const isTrendingBool = isTrending === 'true';
      const categoryId = mongoose.Types.ObjectId.createFromHexString(category);
      const selectedCategory = await clothingCategory.findById(categoryId);
      if (!selectedCategory) {
        throw new Error('Invalid category selected');
      }
      // Find the existing product by ID
      const existingProduct = await Product.findById(id);
      // Check if new images were uploaded
      let updatedImages;
      if (req.files && req.files.length > 0) {
        // If new images were uploaded, use the new images
        updatedImages = req.files.map(file => ({
          filename: file.filename,
          path: file.path
        }));
      } else {
        // If no new images were uploaded, use the existing images
        updatedImages = existingProduct.images;
      }
      const updatedProduct = {
        itemNumber,
        productTitle,
        productDescription,
        msrp,
        images: updatedImages,
        sizes: sizesArray, 
            sizeRatio: sizeRatioArray,
            color: colorsArray,
            casePack: casePackArray,
        upc,
        category: selectedCategory.name,
        inventory: inventoryArray,
        isNewArrival: isNewArrivalBool,
        isTrending: isTrendingBool,
      };
      // Update the product with the updatedProduct object
      const p = await Product.findByIdAndUpdate(id, updatedProduct);
      req.flash('success', 'Product details have been updated!');
      res.redirect('/admin/product');
    
  }));
  // PRoduct Delete Route
router.delete('/admin/product/delete/:id',isLoggedin, wrapAsync( async (req, res) => {
    const { id } = req.params;
    const p = await Product.findById(id);
    p.images.map(async({filename}) => {
        await uploader.destroy(filename);
    })
    
    await Product.findByIdAndDelete(id);
    req.flash('success', "Product is deleted!")
    res.redirect('/admin/product');
}));
// Product Image Delete Route 
router.delete('/admin/product/:productId/image/:imageId', isLoggedin, wrapAsync( async (req, res) => {
    
      const { productId, imageId } = req.params;
      
      // Find the product by ID
      const product = await Product.findById(productId);
  
      // Find the index of the image in the product's images array
      const imageIndex = product.images.findIndex((image) => image._id.toString() === imageId);
  
      // If the image is found, delete it from Cloudinary and remove it from the product's images array
      if (imageIndex !== -1) {
        await uploader.destroy(product.images[imageIndex].filename); // Delete from Cloudinary
        product.images.splice(imageIndex, 1); // Remove from images array
        await product.save(); // Save the product with updated images
  
        // Redirect back to the product editing page with a success flash message
        req.flash('success', 'Image deleted successfully!');
        return res.redirect(`/admin/product/edit/${productId}`);
      } else {
        throw new Error('Image not found in product images array.'); // Throw an error if the image is not found
      }
  
  }));
// Router to fetch new arrivals
router.get('/admin/new-arrivals',isLoggedin, wrapAsync( async (req, res) => {
    
        const newArrivals = await Product.find({ isNewArrival: true });
        res.render('./admin/newArrival', { newArrivals });
    
}));
// Route to fetch trending
router.get('/admin/trendingproducts',isLoggedin,  wrapAsync( async (req, res) => {
   
        const trendingProducts = await Product.find({ isTrending: true });
        res.render('./admin/trending', { trendingProducts });
   
}));
// Route to fetch new arrivals for users
router.get('/new-arrivals', async (req, res) => {
  try {
    const newArrivals = await Product.find({ isNewArrival: true });
    res.render('./admin/home', { newArrivals }); // Assuming 'home' is the correct template name
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/user/home', wrapAsync(async (req, res) => {
  const navbars = await Navbar.find({}).populate('categories'); // Populate categories here
  const newArrivals = await Product.find({ isNewArrival: true }).limit(6);
  const trendingProducts = await Product.find({ isTrending: true });
 
    
  res.render('./admin/home', { trendingProducts,  newArrivals, navbars }); // Remove 'categories' here
  
}));
// User Homepage Route
router.get('/user/products', wrapAsync(async (req, res) => {
  try {
    let products;
    let selectedCategory;

    const navbars = await Navbar.find({});
    const { category } = req.query;

    if (category) {
      products = await Product.find({ category });
      selectedCategory = category;
    } else {
      products = await Product.find({});
    }
    
    const categories = await clothingCategory.find({});
    res.render('./admin/pdetails', { selectedCategory, categories, products, navbars });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error');
  }
}));
// Route to display individual product details
router.get('/user/product/:productId', wrapAsync(async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    const navbars = await Navbar.find({});
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/user/products');
    }
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: productId } 
    }).limit(10); 

    res.render('./admin/userproductDetails', { product, relatedProducts, navbars });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Internal Server Error');
  }
}));

router.get("/user/aboutus",  wrapAsync( async (req, res) => {
  const navbars = await Navbar.find({});
  res.render('./admin/aboutus' ,{  navbars} );
}));

router.get("/user/contactus", wrapAsync( async (req, res) => {
  const navbars = await Navbar.find({});
  res.render('./admin/contactus' ,{  navbars} );
}));

// Route to display categories and potentially products
router.get('/user/category/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    // Find the category by ID
    const category = await clothingCategory.findById(categoryId).populate('products');
    const products = await Product.find({});
    const navbars = await Navbar.find({});
    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/user/home'); // Redirect to a suitable page if category is not found
    }

    // Render a template to display category name and potentially products
    res.render('./admin/categoryPage', { category, products, navbars }); // Modify the template path and variable as needed
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).send('Internal Server Error');
  }
});
// Route to display products of the clicked category through navbar
router.get('/user/showProducts/:categoryId', wrapAsync(async(req, res) => {
  const {categoryId} = req.params;
  const navbars = await Navbar.find({});
  const category = await clothingCategory.findById(categoryId).populate('products');
  res.render('./admin/categoryPage', { category, navbars}); 
 
}));
// Product search route
router.get('/user/search', async (req, res) => {
  try {
    const searchTerm = req.query.q; 
    const navbars = await Navbar.find({});
    const products = await Product.find({
      productTitle: { $regex: searchTerm, $options: 'i' } 
    });

    res.render('./admin/searchResults', { products, searchTerm, navbars });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;