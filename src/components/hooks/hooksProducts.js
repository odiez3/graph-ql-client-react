import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import M from 'materialize-css';
import { Link } from 'react-router-dom';
import { CHECK_DATAUSER } from './hooksUsers';
import Loader from '../../commons/loader';

const GET_CATEGORIES = gql`
  {
    categorias:allCategories{
    _id
    categoryName
  }
  }
`;

export const ListCategories = (props) => {
    const result = useQuery(GET_CATEGORIES);

    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});

    return (
        <ul className="collapsible">
            <li className="active">
                <div className="collapsible-header"><i className="material-icons">toc</i>Departamentos</div>
                <div className="collapsible-body">
                    <ul className="collection">
                        <li>
                            <Link to={`/`}
                                className="sidenav-close"
                            ><i className="material-icons right">send</i>Todos</Link>
                        </li>
                        {
                            result.data && result.data.categorias.map((value, index) => {
                                return <li key={index}>
                                    <Link to={`/products/${value._id}/${value.categoryName}`}
                                        className="sidenav-close"
                                    ><i className="material-icons right">send</i>{value.categoryName}</Link>
                                </li>
                            })
                        }
                    </ul>
                </div>
            </li>
        </ul>
    )
}

export const CategoriesDropDown = (props) => {
    const result = useQuery(GET_CATEGORIES);
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'), {});

    return (
        <ul id='dropCategories' className='dropdown-content'>
            <li>
                <Link to={`/`}
                    className="sidenav-close light-blue-text text-darken-4 "
                ><i className="material-icons right">send</i>Todos</Link>
                <div className="divider"></div>
            </li>
            {
                result.data && result.data.categorias.map((value, index) => {
                    return <li key={index}>
                        <Link to={`/products/${value._id}/${value.categoryName}`}
                            className="yellow-text text-darken-4"
                        ><i className="material-icons right">send</i>{value.categoryName}</Link>
                        <div className="divider"></div>
                    </li>
                })
            }

        </ul>
    )
}


const GET_PRODUCTOS = gql`
query getProductsCategory($idCategorie: String)
{
    productos: getProductsByCategory(idCategorie: $idCategorie){
    id:_id
    productName
    productImage
    productPrice
    productCartDesc
    productStock
  }
}
`;

export const ADD_PRODUCT = gql`
mutation addItemCart($item:CartInput!){
  addItemToCart(item:$item){
    user{
      _id
      userFirstName
      userLastName
    }
    product{
      productName
      productPrice
    }
    quantity
  }
}
`;



export const ListProducts = ({ user, idCategorie }) => {
    let { data } = useQuery(CHECK_DATAUSER, {
        variables: { email: user.email },
    });

    const [quantity, setQuantity] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addItem] = useMutation(ADD_PRODUCT);
    debugger;
    const result = useQuery(GET_PRODUCTOS, {
        variables: { idCategorie: idCategorie ? idCategorie : "" },
    });

    let dataUser = false;

    if (data && data.user) {
        dataUser = data.user;
    }


    if (result.loading) {
        return <div className="row"><div className="col s12 center-align mt-1">
            <Loader />
        </div>
        </div>
    }


    const addProduct = async (value, quantityItem) => {
        setLoading({ ...loading, [value.id]: true });
        if (!quantityItem) {
            quantityItem = 1;
        }

        if (quantityItem >= 1) {
            try {

                await addItem({
                    variables: {
                        item: {
                            user: data.user._id,
                            product: value.id,
                            quantity: quantityItem
                        }
                    }
                });

                setQuantity({ ...quantity, [value.id]: 1 })


                M.toast({ html: `<i class="material-icons right">check</i>Artículo agregado.`, classes: "green darken-2" });
                setLoading({ ...loading, [value.id]: false });
            } catch (error) {

                M.toast({ html: "Ocurrio un error al agregar tu artículo intenta de nuevo.", classes: "red darken-2" });
                setLoading({ ...loading, [value.id]: false });
            }

        }
    }



    M.Collapsible.init(document.querySelectorAll('.collapsible'), {});

    if (result.data && result.data.productos && result.data.productos.length) {
        return result.data.productos.map((value, index) => {
            return (
                <div className="col s12 m6 l3" key={index}>
                    <div className="card">
                        <div className="card-content">
                            <Link to={`/productDetail/${value.id}`} className="row center-align waves-effect">
                                <div className="col s12 ">
                                    <img src={value.productImage} alt={value.productName} className="imgListProduct" />
                                </div>
                                <div className="col s12">
                                    <span className="light-blue-text text-darken-4 bold">{value.productName}</span>
                                </div>
                            </Link>

                            <div className="w-100 center-align labelPrice">
                                ${parseFloat(value.productPrice).toFixed(2)}
                            </div>
                            <div className="w-100 center-align mt-1 grey lighten-2">

                                <button className="waves-effect btn-flat"
                                    disabled={quantity[value.id] === 1}
                                    onClick={() => {
                                        setQuantity({
                                            ...quantity,
                                            [value.id]: quantity[value.id] ? quantity[value.id] - 1 : 1
                                        })
                                    }}
                                ><i className="material-icons">remove</i></button>
                                {quantity[value.id] ? quantity[value.id] : 1}
                                <button className="waves-effect btn-flat"
                                    disabled={quantity[value.id] === value.productStock}
                                    onClick={() => {
                                        let cantidad = 1;
                                        if (quantity[value.id]) {
                                            cantidad = quantity[value.id];
                                        }

                                        if (cantidad + 1 <= value.productStock) {
                                            setQuantity({
                                                ...quantity,
                                                [value.id]: quantity[value.id] ? quantity[value.id] + 1 : 2
                                            })
                                        }
                                    }}
                                >
                                    <i className="material-icons">add</i>
                                </button>
                            </div>

                        </div>
                        {
                            loading[value.id] ?
                                <div className="card-action center-align">
                                    <Loader size="small" />
                                </div>
                                :

                                <div className="card-action center-align">
                                    {
                                        user && dataUser ?
                                            <button className="btn yellow darken-4 w-100"
                                                onClick={() => {
                                                    addProduct(value, quantity[value.id]);
                                                }}
                                            >
                                                <i className="material-icons left">shopping_cart</i>Agregar al Carrito</button>
                                            :
                                            user && !dataUser ?
                                                <Link to="/profile">
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
            )
        })
    } else {
        return <div className="col s12 center-align mt-1">
            No se encontrarón articulos para este departamento.
        </div>
    }
}
