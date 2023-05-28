import {
    useState,
    useEffect,
    useContext,
    createContext,
} from "react";

import {
    getProductsOnSale,
    getBoughtProducts,
    getListedProducts,
    addProduct,
    buyProduct,
} from "../utils/api.jsx"

import { ethers } from "ethers";
import { AlchemyProvider } from "@ethersproject/providers";
import { contractAddress, contractABI, api_key } from "../utils/war.jsx";

console.log(ethers)
const createEthereumContract = () => {
    const provider = new AlchemyProvider("maticmum", api_key);
    const warrantyCardContract = new ethers.Contract(contractAddress, contractABI, provider);
    return warrantyCardContract;
}

import { usePageContext } from "./PageContext.jsx";
import { useUserContext } from "./UserContext.jsx";

const ProductContext = createContext();

export const ProuctContextProvider = ({ children }) => {
    const { user } = useUserContext();
    const { setCurrentPage } = usePageContext();
    const [onSaleProducts, setOnSaleProducts] = useState([]);
    const [myProducts, setMyProducts] = useState([]);
    const [productId, setProductId] = useState("0");
    const [currentProduct, setCurrentProduct] = useState("0");

    const addProductToStore = async (data) => {
        if (user.role === "seller") {
            try {
                const newProduct = await addProduct(data);
                if (newProduct) {
                    setMyProducts([newProduct.data, ...myProducts]);
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const purchaseProduct = async (productId) => {
        if (user.role === "buyer") {
            try {
                const newProduct = await buyProduct(productId);
                if (newProduct) {
                    setMyProducts([newProduct.data, ...myProducts]);
                    setOnSaleProducts(onSaleProducts.filter(product => product._id !== productId));
                }
                setCurrentPage("myProducts");
            } catch (error) {
                console.log(error);
            }
        }
    }

    const selectProduct = (id, page) => {
        if (page === "productsOnSale") {
            setCurrentProduct(onSaleProducts.filter(product => product._id === id)[0]);
        } else if (page === "myProducts") {
            setCurrentProduct(myProducts.filter(product => product._id === id)[0]);
        }
        setProductId(id);
        setCurrentPage("productDetails")
    }

    const activateWarrantyOnProduct = async (product) => {
        const buyer = product.buyer;
        const duration = ethers.parseEther((2592000 * product.warrantyPeriodInMonths) + (31536000 * product.warrantyPeriodInYears));
        const contract = createEthereumContract();
        const tx = await contract.createWarrantyCard(buyer, duration);
        console.log(tx);
    }

    const getInitialValues = async () => {
        if (user.role === "buyer") {
            try {
                const products = await getProductsOnSale();
                const boughtProducts = await getBoughtProducts();
                setOnSaleProducts(products.data);
                setMyProducts(boughtProducts.data);
            } catch (error) {
                console.log(error);
            }
        } else if (user.role === "seller") {
            try {
                const soldProducts = await getListedProducts();
                setMyProducts(soldProducts.data);
            } catch (error) {
                console.log(error);
            }
        }
    }

    useEffect(() => {
        getInitialValues();
    }, [user.role])

    return (
        <ProductContext.Provider value={{
            onSaleProducts,
            myProducts,
            productId,
            currentProduct,
            setProductId,
            addProductToStore,
            selectProduct,
            purchaseProduct,
            activateWarrantyOnProduct,
        }}>
            {children}
        </ProductContext.Provider>
    )
}

export const useProductContext = () => {
    const context = useContext(ProductContext);
    return context;
}