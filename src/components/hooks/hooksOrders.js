import React, { Component } from 'react';
import { useQuery } from '@apollo/react-hooks';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { gql } from 'apollo-boost';
import M from 'materialize-css';
import Loader from '../../commons/loader';
import ConfirmModal from '../../commons/confirmModal';
import { CHECK_DATAUSER } from './hooksUsers';
import { STATUS_ORDERS } from '../../properties';

/*Iconos Orden*/
import process1 from '../../assets/p1.png'
import process2 from '../../assets/p2.png'

import deliver1 from '../../assets/deliver1.png'
import deliver2 from '../../assets/deliver2.png'

import delivered1 from '../../assets/entregado1.png'
import delivered2 from '../../assets/entregado2.png'

import canceled from '../../assets/canceled.png';

const GET_ORDERS = gql`
query getOrders($idOrder:String){
  orders:getOrders(idOrder:$idOrder){
    shortID
    total
    items
    statusOrder
    orderCreated
  }
}
`
const GET_ORDER = gql`
query getOrders($idOrder:String){
  orders:getOrders(idOrder:$idOrder){
    shortID
    total
    items
    statusOrder
    canceled
    orderCreated
    products{
      productName
      productPrice
      quantity
    }
    deliverAdress{
      userFirstName
    userLastName
    userCity
     citySelected{
        nameMuni
      }
    userState
     stateSelected{
        nameEdo
      }
      userNoExt
    userZip
    userPhone
    userNoInt
    userAddress
    userAddress2
    notes    
    }
  }
}

`




export const Orders = (properties) => {
    let { props, dataUser } = properties;

    let idOrder = false;
    if (props && props.match) {
        idOrder = props.match.params.idOrder;
    }
    return <OrderDetail dataUser={dataUser} props={props} idOrder={idOrder} />
}

const OrderDetail = (props) => {
    let { dataUser, idOrder } = props;

    let query = GET_ORDERS;

    if (idOrder) {
        query = GET_ORDER;
    }

    let { loading, data } = useQuery(query, {
        variables: { idUser: dataUser._id, idOrder },
    });

    if (loading) return <div className="row"><div className="col s12 center-align mt-1"><Loader /></div></div>

    if (!data && idOrder) {
        return <div className="container">
            <div className="row">
                <div className="col s12 left-align mt-1 centerContent valign-wrapper">
                    <div className="center-align">
                        <i className="material-icons left">sentiment_very_dissatisfied</i> Este pedido no se ecuentra o no esta asociado a ti. <Link to="/orders">Ver mis pedidos.</Link>
                    </div>
                </div>
            </div>
        </div>
    }

    if (data && data.orders.length && data.orders.length === 1) {
        setTimeout(() => {
            M.Collapsible.init(document.querySelectorAll('.collapsible'), { accordion: true });
        }, 100)

    }

    if (data && data.orders) {
        if (data.orders.length > 1) {
            return (
                <div className="container">

                    {
                        data.orders.map((value, index) => {
                            return (
                                <ul className="collection with-header" key={index}>
                                    <li className="collection-header  grey lighten-3">
                                        {/* <div className="col s12"> */}
                                        <label className="grey-text text-darken-3">El {moment(parseInt(value.orderCreated)).locale('es').format("DD MMM YYYY")} </label>
                                        <span className="right"><label className="grey-text text-darken-3">PEDIDO: <Link to={`/orders/${value.shortID}`}>{value.shortID}</Link> {STATUS_ORDERS[value.statusOrder]}</label></span>
                                        {/* </div> */}
                                    </li>
                                    <li className="collection-item">

                                        <div className="col s12">
                                            <div className="row">
                                                <div className="col s5">
                                                    {value.items > 1 ? `${value.items} Artículos.` : `${value.items} Artículo.`}
                                                </div>
                                                <div className="col s6">
                                                    Total: ${parseFloat(value.total).toFixed(2)}
                                                </div>

                                                <div className="col s1 right-align">
                                                    <Link to={`/orders/${value.shortID}`}><i className="material-icons ">chevron_right</i></Link>
                                                </div>
                                            </div>
                                        </div>


                                    </li>
                                </ul>
                            )
                        })
                    }

                </div>
            )
        } else if (data.orders.length === 1) {
            let dataOrder = data.orders[0];
            debugger;
            let { deliverAdress, products, total, statusOrder, canceled } = dataOrder;
            return (

                <div className="row">

                    <div className="col s12 left-align mt-1">
                        <Link to="/orders"><span className="light-blue-text text-darken-4 bold">
                            <i className="material-icons left bold">chevron_left</i>Pedidos</span></Link>
                    </div>
                    <div className="col s12 mt-1">
                        <div className="divider"></div>
                    </div>
                    <IconStatus statusOrder={statusOrder} clase="hide-on-med-and-up show-on-small" />
                    <div className="col s12 m4 profile">
                        <ul className="collapsible">
                            <li className="active">
                                <div className="collapsible-header headerCollapseDeliver"><i className="material-icons">place</i>Lugar de Entrega </div>
                                <div className="collapsible-body">
                                    <div className="row">
                                        <div className="col s12 left-align deliverAdress">
                                            <p className="bold text-capitalize">
                                                {`${deliverAdress.userFirstName.toLowerCase()} ${deliverAdress.userLastName.toLowerCase()}`}
                                            </p>
                                            <p>
                                                {`${deliverAdress.userAddress} ${deliverAdress.userAddress2}`}
                                            </p>
                                            <p>
                                                <span className="bold">Estado: </span>{deliverAdress.userState}
                                            </p>
                                            <p>
                                                <span className="bold">Ciudad / Municipio :</span> {deliverAdress.userCity}
                                            </p>
                                            <p>
                                                <span className="bold">C.P.: </span>{deliverAdress.userZip}
                                            </p>
                                            <p>
                                                <span className="bold">Exterior:</span> {deliverAdress.userNoExt}
                                            </p>
                                            {deliverAdress.userNoInt && deliverAdress.userNoInt.trim() !== "" ? <p><span className="bold">Interior:</span> {deliverAdress.userNoInt}</p> : null}
                                            <p>
                                                <span className="bold">Teléfono de contacto:</span> {deliverAdress.userPhone}
                                            </p>
                                            {
                                                deliverAdress.notes && deliverAdress.notes.trim() !== "" ?
                                                    <p> <span className="bold">Referencias: </span>{deliverAdress.notes}</p> : null
                                            }
                                        </div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="col s12 m8 profile">
                        <ul className="collapsible">
                            <li className="active">
                                <div className="collapsible-header headerCollapseDeliver">
                                    <i className="material-icons">shopping_cart</i>Resumen Carrito
                                </div>
                                <div className="collapsible-body">
                                    <div className="row">
                                        <div className="col s12">


                                            <table className="highlight">
                                                <thead>
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th>Precio Unitario</th>
                                                        <th>Cantidad</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        products.map((value, index) => {
                                                            return (
                                                                <tr key={index}>
                                                                    <td>{value.productName}</td>
                                                                    <td>${parseFloat(value.productPrice).toFixed(2)}</td>
                                                                    <td className="center-align">{value.quantity}</td>
                                                                    <td className="right-align">${parseFloat(value.productPrice * value.quantity).toFixed(2)}</td>
                                                                </tr>

                                                            )
                                                        })
                                                    }
                                                    <tr className="bold">
                                                        <td></td>
                                                        <td></td>
                                                        <td className="right-align">Total:</td>
                                                        <td className="right-align">${parseFloat(total).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {
                                            statusOrder === 4 ?
                                                canceled && canceled.trim() !== "" ?
                                                    <div className="col s12 mt-1">
                                                        <span className="red-text text-darken-2">Motivo Cancelación: </span>{canceled}
                                                    </div>

                                                    : null
                                                : null
                                        }
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                    <IconStatus statusOrder={statusOrder} clase="hide-on-small-only" />
                </div>
            )
        } else if (!data.orders.length) {
            return (
                <div className="container">
                    <div className="row">
                        <div className="col s12 left-align mt-1 centerContent valign-wrapper bold">
                            <div className="center-align">
                                <i className="material-icons left">sentiment_very_dissatisfied</i> Aún no cuentas con ordenes en tu historial.
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    } else {
        return <div className="container">
            <div className="row">
                <div className="col s12 left-align mt-1 centerContent valign-wrapper bold">
                    <div className="center-align">
                        <i className="material-icons left">sentiment_very_dissatisfied</i> Aún no cuentas con ordenes en tu historial.
                </div>
                </div>
            </div>
        </div>
    }

}

class IconStatus extends Component {

    state = {
        icons: [],
        current: false,
        currentIndex: 0,
        clase: ""
    }

    componentDidMount() {
        let { statusOrder, clase } = this.props;
        let icons = [];
        let current = false;
        switch (statusOrder) {
            case 1:
                current = process1;
                icons.push(process1);
                icons.push(process2);
                break;
            case 2:
                current = deliver1;
                icons.push(deliver1);
                icons.push(deliver2);
                break;
            case 3:
                current = delivered1;
                icons.push(delivered1);
                icons.push(delivered2);
                break;
            case 4:
                current = canceled;
                break;
        }

        this.setState({ icons, statusOrder, clase, current }, () => {
            this.initCicle();
        })

    }

    initCicle = () => {

        let { icons, currentIndex } = this.state;

        if (icons.length > 1) {
            setTimeout(() => {
                if (currentIndex === (icons.length - 1)) {
                    currentIndex = 0;
                } else {
                    currentIndex += 1;
                }
                this.setState({ current: icons[currentIndex], currentIndex }, () => {
                    this.initCicle();
                });
            }, 600)
        }
    }

    render() {
        let { statusOrder, current, clase } = this.state;
        if (!current) return <div className={`col s12  ${clase} center-align`}><Loader size={`small `} /></div>
        return (
            <div className={`col s12 ${clase}  mt-1`}>
                <div className="row">
                    <div className="col s12 center-align light-blue-text text-darken-4 bold">
                        Pedido {STATUS_ORDERS[statusOrder]}
                    </div>
                    <div className="col s12 center-align ">
                        <img src={current} className="responsive-img" />
                    </div>
                    <div className="col s12">
                        <div className="divider"></div>
                    </div>

                </div>
            </div >
        )
    }
}
