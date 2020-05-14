import React, { Component } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { gql } from 'apollo-boost';
import M from 'materialize-css';
import Loader from '../../commons/loader';
import ConfirmModal from '../../commons/confirmModal';



const DELETE_ITEM = gql`
mutation deleteItem($itemID:String!){
  deleteCartItem(idItem:$itemID)
}
`;


const CARTINFO_SUBS = gql`
 subscription infoCart($userID:String!){
 userCart(userID:$userID){
  totalItems
   userID
   item{
    _id
    product{
      productName
      productPrice
      productSKU
      productImage
    }
    quantity
  }
  }
}
`;

export const CARTITEMS = gql`
query getCartItems{
  cartItems:getCartItems{
    totalItems
   userID
   item{
    _id
    product{
      productName
      productPrice
      productSKU
      productImage
    }
    quantity
  }
  }
}
`;

export const CartInfo = (props) => {
    let {dataUser,presentacion} = props;
    return <NavCart dataUser={dataUser} presentacion={presentacion} />
}

const NavCart = (props) =>{
    let { dataUser, presentacion } = props;

    let { loading, data, refetch } = useQuery(CARTITEMS);

    return <SubCart datos={data} dataUser={dataUser} presentacion={presentacion} loadingData={loading} refetchData={refetch} />
}


const SubCart = (props) => {
    let { dataUser, presentacion,datos,loadingData,refetchData } = props;

    let dataInfo = useSubscription(
        CARTINFO_SUBS,
        { variables: { userID: dataUser._id }},
    );

    let dataFromSub = false;
    
    if (loadingData && presentacion == "LIST") return <div className="row"><div className="col s12 center-align mt-1"><Loader /></div></div>

    if (!dataInfo.loading && dataInfo.data && dataInfo.data.userCart) {
        dataFromSub = dataInfo.data.userCart;
    } else {
        if (datos) {
            dataFromSub = datos.cartItems;
        }
    }
 
    if (!dataFromSub || (dataFromSub.totalItems === 0 && (presentacion !== "LIST"))) return null
   
    if (presentacion === "NAVBAR") {
        return <li className="hide-on-med-and-down"><Link to="/cart" className="sidenav-close ">
            <i className="material-icons left">shopping_cart</i><span className="new badge yellow darken-4" data-badge-caption="">{dataFromSub.totalItems}</span>
        </Link></li>
    } else if (presentacion === "SIDENAV") {
        return <li><Link to="/cart" className="sidenav-close">
            <i className="material-icons left">shopping_cart</i><span className="new badge yellow darken-4" data-badge-caption="">{dataFromSub.totalItems}</span>
            Mi Carrito
        </Link></li>
    } else if (presentacion === "LIST") {
        refetchData();
        return <ItemsCart data={dataFromSub} dataUser={dataUser} refetch={refetchData}/>
    }


}


const ItemsCart = ({ data, dataUser, refetch }) => {
    const [deleteItem] = useMutation(DELETE_ITEM);
    let total = 0;
    if (data.totalItems >= 1) {
        for (let item of data.item) {
            total += parseFloat(item.quantity * item.product.productPrice);
        }
    }

    return <Cart data={data} total={total} deleteItem={deleteItem} dataUser={dataUser} refetch={refetch} />

}


class Cart extends Component {

    state = {
        data: false,
        deleteItem: false,
        cancelItem: false,
        total: false,
        item: false,
        instanceM: false,
        dataUser: false,
        loading: false
    }

    componentDidUpdate(prevProps) {
        // Uso tipico (no olvides de comparar los props):
     
        if (this.props.data !== prevProps.data) {
            this.setState({ data: this.props.data });
        }
        if (this.props.total !== prevProps.total) {
            this.setState({ total: this.props.total });
        }
    }

    componentDidMount() {
     
        let { data, deleteItem, cancelItem, total, dataUser } = this.props;

        this.setState({ data, deleteItem, cancelItem, total, dataUser });

        if (document.querySelectorAll('.modal')[0]) {
            M.Modal.init(document.querySelectorAll('.modal'), {});
            let instance = M.Modal.getInstance(document.querySelectorAll('.modal')[0]);

            if (!this.state.instanceM) {
                this.setState({ instanceM: instance });
            }
        }
    }

    fDeleteItem = async (item) => {
        this.setState({loading:true});
      
        try {
            await this.state.deleteItem({
                variables: {
                    itemID: item._id
                }
            });
           // this.props.refetch()
            this.setState({ item: false,loading:false });
        } catch (error) {
            this.setState({loading:false});
            M.toast({ html: "No se logro eliminar el artículo del carrito intente de nuevo.", classes: "red darken-2" });
        }
    }

    cancelItem = () => {
        this.setState({ item: false }, () => {
            this.state.instanceM.close();
        })
    }

    render() {
        let { data, total, item, loading } = this.state;
        return (
            <div className="col s12 mt-1">
                <div className="row">
                    <div className="col s12 left-align">
                        <h5 className="bold light-blue-text text-darken-4">Resumen de Carrito</h5>
                        <div className="divider"></div>
                    </div>
                </div>
                {
                    !data.totalItems ?

                        <div className="col s12 left-align mt-1 bold">
                            <i className="material-icons left">sentiment_very_dissatisfied</i> Aún no cuentas con artículos en tu carrito <Link to="/">ver productos</Link> .
            </div>

                        :

                        <React.Fragment>
                            {
                                data.item.map((value, index) => {
                                    return (
                                        <div className="row infoItem z-depth-3" key={index}>
                                            <div className="col s12 center-align yellow darken-4 white-text">
                                                <span className="truncate bold ">
                                                    <span className="pointer right waves-effect"
                                                        onClick={() => {
                                                            this.setState({ item: value }, () => {
                                                                if (this.state.item) {
                                                                    this.state.instanceM.open();
                                                                }
                                                            });
                                                        }}
                                                    ><i className="material-icons left">delete</i>Eliminar</span>
                                                    {value.product.productName}
                                                </span>
                                            </div>
                                            <div className="col s12 m4 l4">
                                                <div className="row">
                                                    <div className="col s12 center-align">
                                                        <img className="responsive-img" src={value.product.productImage} alt={value.product.productName} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col s12 m8 l8">
                                                <div className="row mt-1">
                                                    <div className="col s12 right-align">
                                                        Precio:  <span className="bold">${parseFloat(value.product.productPrice).toFixed(2)}</span>
                                                    </div>
                                                    <div className="col s12 right-align mt-1">
                                                        Cantidad: <span className="bold">{value.quantity} {value.quantity > 1 ? "pzas" : "pzas"}</span>
                                                    </div>
                                                    <div className="col s12 divider mt-1">

                                                    </div>
                                                    <div className="col s12 right-align">
                                                        Total Artículo: <span className="bold">${parseFloat(value.quantity * value.product.productPrice).toFixed(2)}</span>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }

                            <div className="row">
                                <div className="col s12 right-align light-blue darken-4 white-text subtotal">
                                    <span className="left">Subtotal</span>${total.toFixed(2)}
                                </div>
                                <div className="col s12 center-align mt-1">
                                    {
                                        loading ?
                                            <Loader />
                                            :
                                            <Link to="/deliverAdress" className="btn waves-effect yellow darken-4 bold btnContinuar"
                                            >
                                                <i className="material-icons right">assignment_turned_in</i> Continuar
                        </Link>
                                    }

                                </div>
                            </div>
                        </React.Fragment>
                }
                <ConfirmModal
                    content="Por favor confirma que deseas eliminar:"
                    header="Eliminar Artículo."
                    item={item}
                    actionDone={this.fDeleteItem}
                    actionCancel={this.cancelItem}
                />
            </div>
        )
    }
}