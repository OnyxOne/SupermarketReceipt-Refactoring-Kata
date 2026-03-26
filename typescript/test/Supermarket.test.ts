import {FakeCatalog} from "./FakeCatalog"
import {Product} from "../src/model/Product"
import {SupermarketCatalog} from "../src/model/SupermarketCatalog"
import {Receipt} from "../src/model/Receipt"
import {ShoppingCart} from "../src/model/ShoppingCart"
import {Teller} from "../src/model/Teller"
import {SpecialOfferType} from "../src/model/SpecialOfferType"
import {ProductUnit} from "../src/model/ProductUnit"
import {assert} from "chai";
import type { Discount } from '../src/model/Discount'

const assertTotalPrice = (receipt: Receipt, expectedTotal: number) => {
    assert.approximately(receipt.getTotalPrice(), expectedTotal, 0.01);
};

const assertReceiptHasItems = (receipt: Receipt, expectedItems: Item[]) => {
    assert.equal(receipt.getItems().length, expectedItems.length);

    const receiptItems = receipt.getItems();
    expectedItems.forEach((expectedItem, index) => {
        const receiptItem = receiptItems[index];
        assert.equal(receiptItem.product, expectedItem.product);
        assert.equal(receiptItem.price, expectedItem.price);
        assert.approximately(receiptItem.totalPrice, expectedItem.totalPrice, 0.01);
        assert.equal(receiptItem.quantity, expectedItem.quantity);
    });
};

const assertHasAmountOfDiscounts = (receipt: Receipt, expectedCount: number) => {
    assert.equal(receipt.getDiscounts().length, expectedCount);
};

function assertDiscounts(receipt: Receipt, discounts: Discount[]) {
    assertHasAmountOfDiscounts(receipt, discounts.length);
    assert.deepEqual(receipt.getDiscounts(), discounts)
}

function assertDiscountDescriptionWithAmount(receipt: Receipt, expectedDiscountDescription: string, expectedDiscountAmount: number) {
    const discount = receipt.getDiscounts()[0]
    assert.equal(discount.description, expectedDiscountDescription)
    assert.approximately(discount.discountAmount, expectedDiscountAmount, 0.01)
}

interface Item {
    product: Product;
    price: number;
    totalPrice: number;
    quantity: number;
}

describe('Supermarket', () => {

    const catalogWithProducts: SupermarketCatalog = new FakeCatalog();
    const toothbrush: Product = new Product("toothbrush", ProductUnit.Each);
    catalogWithProducts.addProduct(toothbrush, 0.99);
    const apples: Product = new Product("apples", ProductUnit.Kilo);
    catalogWithProducts.addProduct(apples, 1.99);

    it('No discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(apples, 2.5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 4.975);
        assertHasAmountOfDiscounts(receipt, 0);
        const items = [
            {
                product: apples,
                price: 1.99,
                totalPrice: 2.5*1.99,
                quantity: 2.5
            }
        ];
        assertReceiptHasItems(receipt, items);
    });
    it('Ten percent discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 * 0.9);

        const expectedDiscounts = [
            {
                description: "10% off",
                discountAmount: 0.099,
                product: {
                    name: "toothbrush",
                    unit: 1
                }
            }
        ];

        assertDiscounts(receipt, expectedDiscounts);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 0.99,
                quantity: 1
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Three for two discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.ThreeForTwo, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 3);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 * 2);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "3 for 2", 0.99);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 3*0.99,
                quantity: 3
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Two for amount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 2);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 1.50);
        assertHasAmountOfDiscounts(receipt, 1);

        assertDiscountDescriptionWithAmount(receipt, "2 for 1.5", 1.98 - 1.50);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 2*0.99,
                quantity: 2
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Five for amount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 1.50);
        assertHasAmountOfDiscounts(receipt, 1);

        assertDiscountDescriptionWithAmount(receipt, "5 for 1.5", 4.95 - 1.50);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 5*0.99,
                quantity: 5
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Two for amount buy seven', () => {
       // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 7);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, (3 * 1.5 + 0.99));
        assertHasAmountOfDiscounts(receipt, 1);

        assertDiscountDescriptionWithAmount(receipt, "2 for 1.5", ((6 * 0.99) - (3 * 1.5)));

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 7*0.99,
                quantity: 7
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Last offer takes precedence', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 4.00);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 7);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertHasAmountOfDiscounts(receipt, 1);

        assertDiscountDescriptionWithAmount(receipt, "2 for 1.5", ((6 * 0.99) - (3 * 1.5)));
    });
    it('Three for two below threshold gives no discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.ThreeForTwo, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 2);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 2 * 0.99);
        assertHasAmountOfDiscounts(receipt, 0);
    });
    it('Two for amount below threshold gives no discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99);
        assertHasAmountOfDiscounts(receipt, 0);
    });
    it('Five for amount below threshold gives no discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 3.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 4);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 4 * 0.99);
        assertHasAmountOfDiscounts(receipt, 0);
    });
    it('Three for two buy five', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.ThreeForTwo, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 4 * 0.99);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "3 for 2", 0.99);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 5*0.99,
                quantity: 5
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Five for amount buy seven', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.FiveForAmount, toothbrush, 3.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 7);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 3.50 + 2 * 0.99);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "5 for 3.5", 7 * 0.99 - (3.50 + 2 * 0.99));

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 7*0.99,
                quantity: 7
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Multiple products with different offers', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, apples, 20.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);
        cart.addItemQuantity(apples, 2.5);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 * 0.9 + 2.5 * 1.99 * 0.8);
        assertHasAmountOfDiscounts(receipt, 2);
    });
    it('Twenty percent discount using ten percent discount mismatch', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 20.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 * 0.8);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "20% off", 0.99 * 0.2);
    });
    it('addItem adds single quantity', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItem(toothbrush);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 * 0.9);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 0.99,
                quantity: 1
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Same product added multiple times aggregates for discount', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TwoForAmount, toothbrush, 1.50);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 2);
        cart.addItemQuantity(toothbrush, 2);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 2 * 1.50);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "2 for 1.5", 4 * 0.99 - 2 * 1.50);

        const expectedItems = [
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 2*0.99,
                quantity: 2
            },
            {
                product: toothbrush,
                price: 0.99,
                totalPrice: 2*0.99,
                quantity: 2
            }
        ];
        assertReceiptHasItems(receipt, expectedItems);
    });
    it('Negative percent discount increases total', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, -10.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 + 0.99 * 0.1);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "-10% off", -0.099);
    });
    it('120 percent discount makes total negative', () => {
        // ARRANGE
        const teller: Teller = new Teller(catalogWithProducts);
        teller.addSpecialOffer(SpecialOfferType.TenPercentDiscount, toothbrush, 120.0);

        const cart: ShoppingCart = new ShoppingCart();
        cart.addItemQuantity(toothbrush, 1);

        // ACT
        const receipt: Receipt = teller.checksOutArticlesFrom(cart);

        // ASSERT
        assertTotalPrice(receipt, 0.99 - 0.99 * 1.2);
        assertHasAmountOfDiscounts(receipt, 1);
        assertDiscountDescriptionWithAmount(receipt, "120% off", 0.99 * 1.2);
    });
});


