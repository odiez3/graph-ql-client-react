import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { ADD_PRODUCT } from './hooks/hooksProducts';
import { CHECK_DATAUSER } from './hooks/hooksUsers';
import M from 'materialize-css';
import Loader from '../commons/loader';

const PRODUCT_DETAIL = gql`
query getProduct($id:String!){
  product:getProductByID(id:$id){
    _id
    productName
    productImage
    productPrice
    productCartDesc
    productLongDesc
    productStock
  }
}`;


export default function ProductDetail({ props, user }) {

    let { params } = props.match;

    let dataUser = useQuery(CHECK_DATAUSER, {
        variables: { email: user.email },
    });

    let { loading, data } = useQuery(PRODUCT_DETAIL, {
        variables: { id: params.idProduct },
    });

    const [addItem] = useMutation(ADD_PRODUCT);

    if (loading || dataUser.loading) return (<div className="row">
        <div className="col s12 center-align mt-1">
            <Loader />
        </div>
    </div>)

    if (!data) {
        props.history.push("/")
    } else {
        return (
            <PruductDetailComponent product={data.product} addItem={addItem} user={user} dataUser={dataUser.data} />
        )
    }
}

class PruductDetailComponent extends Component {

    state = {
        product: false,
        quantity: 1,
        dataUser: false,
        user: false,
        addItem: false,
        loading: false
    }

    componentDidMount() {
        console.log("DATAAA", this.props);
        this.setState({
            product: this.props.product,
            user: this.props.user,
            dataUser: this.props.dataUser,
            addItem: this.props.addItem
        });
    }



    addProduct = async () => {
        this.setState({ loading: true });
        let { quantity, product, dataUser, addItem } = this.state;
        if (!quantity) {
            quantity = 1;
        }

        if (quantity >= 1) {
            try {
                await addItem({
                    variables: {
                        item: {
                            user: dataUser.user._id,
                            product: product._id,
                            quantity: quantity
                        }
                    }
                });

                this.setState({ quantity: 1, loading: false });
                M.toast({ html: `<i class="material-icons right">check</i>Artículo agregado.`, classes: "green darken-2" })
            } catch (error) {
                this.setState({ loading: false });
                M.toast({ html: "Ocurrio un error al agregar tu artículo intenta de nuevo.", classes: "red darken-2" })
            }

        }
    }

    render() {
        let { product, quantity, user, loading,dataUser } = this.state;
        return (
            <div className="container productDetail">
                <div className="row mt-1 z-depth-3">
                    <div className="col s12 m6 l6">
                        <img src={product.productImage} alt={product.productName} className="responsive-img" />
                    </div>
                    <div className="col s12 m6 l6">
                        <div className="row">
                            <div className="col s12 center-align titleProduct bold mt-1">
                                {product.productName}
                                <div className="divider"></div>
                            </div>
                            <div className="col s12 left-align  price mt-2">
                                ${parseFloat(product.productPrice).toFixed(2)}
                            </div>

                            {
                                product.productCartDesc && product.productCartDesc.trim() !== "" ?
                                    <div className="col s12 description mt-1">
                                        <label>{product.productCartDesc}</label>
                                    </div>
                                    : null
                            }

                            {
                                product.productLongDesc && product.productLongDesc.trim() !== "" ?
                                    <div className="col s12 description mt-1">
                                        <label>{product.productLongDesc}</label>
                                    </div>
                                    : null
                            }
                            <div className="col s12 center-align mt-1 buttonsProducts">
                                <button className="waves-effect btn  buttonsProducts mr-1 white black-text"
                                    disabled={quantity === 1}
                                    onClick={() => {
                                        this.setState({ quantity: quantity - 1 })
                                    }}
                                ><i className="material-icons buttonsProducts">remove</i></button>
                                {quantity}
                                <button className="waves-effect btn ml-1 white black-text"
                                    disabled={quantity === product.productStock}
                                    onClick={() => {

                                        if (quantity <= product.productStock) {
                                            this.setState({ quantity: quantity + 1 })
                                        }

                                    }}
                                >
                                    <i className="material-icons buttonsProducts">add</i>
                                </button>
                            </div>

                            <div className="col s12 left-align mt-1">
                                {product.productStock} disponibles.
                            </div>

                            {
                                loading ?
                                    <div className="col s12 center-align mt-1">
                                        <Loader />
                                    </div>
                                    :
                                    <div className="col s12 center-align mt-1">
                                        {
                                            user && dataUser ?
                                                <button className="btn yellow darken-4 w-100"
                                                    onClick={this.addProduct}
                                                >
                                                    <i className="material-icons left">shopping_cart</i>Agregar al Carrito</button>
                                                :
                                                user && !dataUser ?
                                                <Link className="btn-flat yellow-text text-darken-4 w-100" to="/profile">
                                                    Actualize su perfil de usuario.
                                        </Link>
                                        :
                                                <Link to="/login">
                                                    Inicia Sesión para Comprar
                                             </Link>
                                        }
                                    </div>
                            }



                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

