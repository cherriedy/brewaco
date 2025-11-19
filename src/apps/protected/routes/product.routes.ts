import { createProduct } from "#common/controllers/product/create-product.controller.js";
import { deleteProduct } from "#common/controllers/product/delete-product.controller.js";
import { getProduct } from "#common/controllers/product/get-product.controller.js";
import { getProducts } from "#common/controllers/product/get-products.controller.js";
import { updateProduct } from "#common/controllers/product/update-product.controller.js";
import { Router } from "express";
import multer from "multer";

// Lưu tạm vào server trước khi upload lên Cloudinary
const storage = multer.diskStorage({});
export const upload = multer({ storage });

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.array("files", 5), createProduct);
router.put("/:id", upload.fields([
    { name: "files", maxCount: 5 },    // ảnh mới upload
    { name: "images", maxCount: 5 }    // ảnh cũ dạng text (Multer bỏ qua)
  ]), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
