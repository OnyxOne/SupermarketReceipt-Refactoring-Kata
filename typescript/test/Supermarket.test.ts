import {FakeCatalog} from "./FakeCatalog"
import {Product} from "../src/model/Product"
import {SupermarketCatalog} from "../src/model/SupermarketCatalog"
import {Receipt} from "../src/model/Receipt"
import {ShoppingCart} from "../src/model/ShoppingCart"
import {Teller} from "../src/model/Teller"
import {SpecialOfferType} from "../src/model/SpecialOfferType"
import {ProductUnit} from "../src/model/ProductUnit"
import {assert} from "chai";

describe('Supermarket', () => {
    it('No discount', () => {
        // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);
        const apples: Product = new Product("apples", ProductUnit.Kilo);
        catalog.addProduct(apples, 1.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(apples, 2.5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.approximately(receipt.getTotalPrice(), 4.975, 0.01);
        assert.isEmpty(receipt.getDiscounts());
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, apples);
        assert.equal(receiptItem.price, 1.99);
        assert.approximately(receiptItem.totalPrice, 2.5*1.99, 0.01);
        assert.equal(receiptItem.quantity, 2.5);
    });
    it('Ten percent discount', () => {
        // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);
        const apples: Product = new Product("apples", ProductUnit.Kilo);
        catalog.addProduct(apples, 1.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.approximately(receipt.getTotalPrice(), 0.99 * 0.9, 0.01);
        assert.deepEqual(receipt.getDiscounts(), [
            {
            description: "10% off",
            discountAmount: 0.099,
            product: {
                name: "toothbrush",
                unit: 1
            }
        }]);
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, toothbrush);
        assert.equal(receiptItem.price, 0.99);
        assert.approximately(receiptItem.totalPrice, 1*0.99, 0.01);
        assert.equal(receiptItem.quantity, 1);
    });
    it('Three for two discount', () => {
        // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.ThreeForTwo, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 3);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.approximately(receipt.getTotalPrice(), 0.99 * 2, 0.01);
        const discount = receipt.getDiscounts()[0];
        assert.equal(discount.description, "3 for 2");
        assert.approximately(discount.discountAmount, 0.99, 0.01);
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, toothbrush);
        assert.equal(receiptItem.price, 0.99);
        assert.approximately(receiptItem.totalPrice, 3*0.99, 0.01);
        assert.equal(receiptItem.quantity, 3);
    });
    it('Two for amount', () => {
        // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 2);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.equal(receipt.getTotalPrice(), 1.50);
        const discount = receipt.getDiscounts()[0];
        assert.equal(discount.description, "2 for 1.5");
        assert.approximately(discount.discountAmount, 1.98 - 1.50, 0.01);
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, toothbrush);
        assert.equal(receiptItem.price, 0.99);
        assert.approximately(receiptItem.totalPrice, 2*0.99, 0.01);
        assert.equal(receiptItem.quantity, 2);
    });
    it('Five for amount', () => {
        // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.equal(receipt.getTotalPrice(), 1.50);
        const discount = receipt.getDiscounts()[0];
        assert.equal(discount.description, "5 for 1.5");
        assert.approximately(discount.discountAmount, 4.95 - 1.50, 0.01);
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, toothbrush);
        assert.equal(receiptItem.price, 0.99);
        assert.approximately(receiptItem.totalPrice, 5*0.99, 0.01);
        assert.equal(receiptItem.quantity, 5);
    });
    it('Two for amount buy seven', () => {
       // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 7);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assert.equal(receipt.getTotalPrice(), (3 * 1.5 + 0.99));
        const discount = receipt.getDiscounts()[0];
        assert.equal(discount.description, "2 for 1.5");
        assert.equal(receipt.getDiscounts().length, 1)
        assert.approximately(discount.discountAmount, ((6 * 0.99) - (3 * 1.5)), 0.01);
        assert.equal(receipt.getItems().length, 1);
        const receiptItem = receipt.getItems()[0];
        assert.equal(receiptItem.product, toothbrush);
        assert.equal(receiptItem.price, 0.99);
        assert.approximately(receiptItem.totalPrice, 7*0.99, 0.01);
        assert.equal(receiptItem.quantity, 7);
    });
    it('Last offer takes precedence', () => {
       // ARRANGE
        const catalog: SupermarketCatalog = new FakeCatalog();
        const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
        catalog.addProduct(toothbrush, 0.99);

        const teller: Teller = new Teller(catalog);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 4.00);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 7);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        const discount = receipt.getDiscounts()[0];
        assert.equal(discount.description, "2 for 1.5");
    });
});
