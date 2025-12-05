import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    status: { type: Boolean, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnails: { type: [String], default: [] }
});

productSchema.plugin(mongoosePaginate);

productSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    }
});

const ProductModel = mongoose.model("products", productSchema);
export default ProductModel;