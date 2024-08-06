import mongoose from 'mongoose';

export interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

export interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

export interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema<PaymentDoc>({
    orderId: {
      type: String,
      required: true
    },
    stripeId: {
      type: String,
      required: true
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  });

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment({
    orderId: attrs.orderId,
    stripeId: attrs.stripeId
  });
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
