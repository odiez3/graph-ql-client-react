import React, { Component } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import M from 'materialize-css';
import { AutoCompleteEdos, AutoCompleteMunicipio } from './hooks/hooksLocations';
import { CARTITEMS } from './hooks/hooksCart';
import Loader from '../commons/loader';
import { gql } from 'apollo-boost';


const CREATE_ORDER = gql`
mutation createOrder($orderToDeliver:OrderToDeliverInput!){
 orden:createOrder(orderToDeliver:$orderToDeliver){
    success,
    orderID,
    message
  }
}
`



function validUserData(dataUser) {
    let { userFirstName, userLastName, userPhone, userState, userCity, userZip, userNoExt, userAddress } = dataUser;

    setTimeout(() => {
        M.updateTextFields();
    }, 100)
    if (!userFirstName || userFirstName.trim() === "") {
        return false;
    }

    if (!userLastName || userLastName.trim() === "") {
        return false;
    }

    if (!userPhone || userPhone.trim() === "") {
        return false;
    }

    if (!userState || userState.trim() === "") {
        return false;
    }

    if (!userCity || userCity.trim() === "") {
        return false;
    }

    if (!userZip || userZip.trim() === "") {
        return false;
    }

    if (!userNoExt || userNoExt.trim() === "") {
        return false;
    }

    if (!userAddress || userAddress.trim() === "") {
        return false;
    }


    return true;
}

export default function DeliverInfo(props) {
    console.log(props);
    let { dataUser } = props;

    if (!dataUser) return (<div className="container center-align"><div className="col s12 mt-1"><Loader /></div></div>)


    return <CartItems dataUser={dataUser} props={props.props} />
}

function CartItems(props) {
    let { dataUser } = props;
    let { loading, data, refetch } = useQuery(CARTITEMS, {
        variables: { id: dataUser._id },
    });

    const [createOrder] = useMutation(CREATE_ORDER);

    if (!dataUser) {
        props.props.history.push('/profile');
    }

    if (loading && !data) return (<div className="container center-align"><div className="col s12 mt-1"><Loader /></div></div>)

    return <DeliverForm dataUser={dataUser} cartItems={data.cartItems} props={props.props} createOrder={createOrder} />
}

class DeliverForm extends Component {

    state = {
        userFirstName: "",userLastName: "", userPhone: "",
        userState: "",stateSelected: false, citySelected: false,
        userCity: "",userZip: "",userNoExt: "",userNoInt: "",
        userAddress: "",
        userAddress2: "",
        notes:"",
        otherAddress: false,
        validData: true,
        createOrder: false,
        loading:false
    }

    componentDidMount() {
        console.log("DELIVER ADRESS",this.props);
        if (!this.props.cartItems.item.length) {
            this.props.props.history.push('/');
        } else {
            let { userFirstName, userLastName, userPhone, userState, userCity, userZip, userNoExt, userNoInt, userAddress, userAddress2, stateSelected, citySelected } = this.props.dataUser;
         
            let validData = validUserData(this.props.dataUser);

            this.setState({ userFirstName, userLastName, userPhone, userState, userCity, userZip, userNoExt, userNoInt, userAddress, userAddress2, validData, stateSelected, citySelected }, () => {
                M.updateTextFields();
            });
        }
        M.Collapsible.init(document.querySelectorAll('.collapsible'), { accordion: true });
    }

    changeValue = (event) => {
        let { id, value } = event.target;

        this.setState({ [id]: value });
    }

    submitData = async (event) => {
        event.preventDefault();

        this.setState({loading:true});

        let { userFirstName, userLastName, userPhone, userState, userCity, userZip, userNoExt, userNoInt, 
            userAddress, userAddress2, stateSelected, citySelected,notes } = this.state;

        try{
           let result =  await this.props.createOrder({
                variables: {
                    orderToDeliver: {
                        userFirstName,
                        userLastName,
                        userPhone,
                        userCity,
                        citySelected: citySelected._id,
                        userState,
                        stateSelected: stateSelected._id,
                        userZip,
                        userNoExt,
                        userNoInt,
                        userAddress,
                        userAddress2,
                        notes
                      }
                }
            });
            debugger;
            console.log(result);

            if(result && result.data){
                let {success,orderID,message} = result.data.orden;
                if(success){
                    M.toast({html:message,classes:"green darken-2"});
                    this.props.props.history.push(`/orders/${orderID}`);
                }else{
                    M.toast({html:message,classes:"red darken-2"});
                }
            }

        }catch(error){
            console.log(error);
        }
    }

    getTotal = () => {
        let total = 0;

        for (let item of this.props.cartItems.item) {
            total += item.quantity * item.product.productPrice;
        }

        return total;
    }

    render() {
        let { userFirstName, userLastName, userPhone, userState, userCity, userZip, userNoExt, userNoInt, userAddress, userAddress2, notes, validData, otherAddress, stateSelected,loading } = this.state;


        return (
            // <div className="container">
            <div className="row" >
                <div className="col s12 m4 profile">
                    <ul className="collapsible">
                        <li className="active">
                            <div className="collapsible-header headerCollapseDeliver"><i className="material-icons">place</i>¿Dondé sera la entrega? </div>
                            <div className="collapsible-body">
                                <div className="row">
                                    {
                                        validData ?

                                            <div className="col s12">
                                                <p>
                                                    <label>
                                                        <input type="checkbox" onChange={(event) => {
                                                            this.setState({ otherAddress: event.target.checked }, () => {
                                                                setTimeout(() => {
                                                                    M.updateTextFields();
                                                                }, 100)

                                                            });
                                                        }} />
                                                        <span>Cambiar los datos para esta entrega.</span>
                                                    </label>
                                                </p>
                                            </div>
                                            : null
                                    }
                                    {
                                        validData && !otherAddress ?

                                            <div className="col s12 left-align deliverAdress">
                                                <p className="bold text-capitalize">
                                                    {`${userFirstName.toLowerCase()} ${userLastName.toLowerCase()}`}
                                                </p>
                                                <p>
                                                    {`${userAddress} ${userAddress2}`}
                                                </p>
                                                <p>
                                                    <span className="bold">Estado: </span>{userState}
                                                </p>
                                                <p>
                                                    <span className="bold">Ciudad / Municipio :</span> {userCity}
                                                </p>
                                                <p>
                                                    <span className="bold">C.P.: </span>{userZip}
                                                </p>
                                                <p>
                                                    <span className="bold">Exterior:</span> {userNoExt}
                                                </p>
                                                {userNoInt.trim() !== "" ? <p><span className="bold">Interior:</span> {userNoInt}</p> : null}
                                                <p>
                                                    <span className="bold">Teléfono de contacto:</span> {userPhone}
                                                </p>
                                            </div> : null
                                    }

                                    {
                                        !validData || otherAddress ?
                                            <div className="row form-deliver">
                                                <div className="col s12 bold mb-1">
                                                    Contacto de entrega:
                                                                <div className="divider"></div>
                                                </div>
                                                <div className="input-field col s12 m6">
                                                    <input id="userFirstName" type="text"
                                                        value={userFirstName}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userFirstName">Nombre*</label>
                                                </div>
                                                <div className="input-field col s12 m6">

                                                    <input id="userLastName" type="text"
                                                        value={userLastName}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userLastName">Apellidos*</label>
                                                </div>
                                                <div className="input-field col s12 m6">
                                                    <input id="userPhone" type="text"
                                                        value={userPhone}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userPhone">Teléfono*</label>
                                                </div>

                                                <div className="col s12 bold mb-1">
                                                    Dirección de entrega:
                                                                <div className="divider" />
                                                </div>

                                                <AutoCompleteEdos className="input-field col s6" required={true}
                                                    value={userState}
                                                    onChange={(value) => {
                                                        this.setState({ userState: value.desc, stateSelected: value.state });
                                                    }}
                                                />


                                                <AutoCompleteMunicipio className="input-field col s6" required={true}
                                                    value={userCity}
                                                    estado={stateSelected} value={userCity}
                                                    onChange={(value) => {
                                                        this.setState({ userCity: value.desc, citySelected: value.muni });
                                                    }}
                                                />

                                                <div className="input-field col s12 m6">
                                                    <input id="userZip" type="text"
                                                        value={userZip}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userZip">Código Postal*</label>
                                                </div>

                                                <div className="input-field col s6 m3">
                                                    <input id="userNoExt" type="text"
                                                        value={userNoExt}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userNoExt">No. Exterior*</label>
                                                </div>

                                                <div className="input-field col s6 m3">
                                                    <input id="userNoInt" type="text"
                                                        value={userNoInt}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userNoInt">No. Interior*</label>
                                                </div>

                                                <div className="input-field col s12">
                                                    <input id="userAddress" type="text"
                                                        value={userAddress}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userAddress">Dirección Línea 1*</label>
                                                </div>

                                                <div className="input-field col s12">
                                                    <input id="userAddress2" type="text"
                                                        value={userAddress2}
                                                        onChange={this.changeValue}
                                                    />
                                                    <label htmlFor="userAddress2">Dirección Línea 2</label>
                                                </div>

                                                <div className="col s12 left-align">
                                                    <label>Campos obligatorios (*)</label>
                                                    <p><label><span className="red-text text-darken-4">Nota:</span> Si tu estado o municipio no se ecuentra es debido a que aún no contamos con cobertura.</label></p>
                                                </div>


                                            </div>
                                            : null
                                    }
                                    <div className="row form-deliver mt-1">
                                        <div className="input-field col s12">
                                            <input id="notes" type="text"
                                                value={notes}
                                                onChange={this.changeValue}
                                            />
                                            <label htmlFor="notes">Referencias</label>
                                            <span className="helper-text">Ejemplo: Casa color Azul con Portón Blanco</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="col s12 m8 profile">
                    <ul className="collapsible">
                        <li className="active">
                            <div className="collapsible-header headerCollapseDeliver"><i className="material-icons">shopping_cart</i>Resumen Carrito</div>
                            <div className="collapsible-body">
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
                                            this.props.cartItems.item.map((value, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <td>{value.product.productName}</td>
                                                        <td>${parseFloat(value.product.productPrice).toFixed(2)}</td>
                                                        <td className="center-align">{value.quantity}</td>
                                                        <td className="right-align">${parseFloat(value.product.productPrice * value.quantity).toFixed(2)}</td>
                                                    </tr>

                                                )
                                            })
                                        }
                                        <tr className="bold">
                                            <td></td>
                                            <td></td>
                                            <td className="right-align">Total:</td>
                                            <td className="right-align">${this.getTotal().toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {
                                    loading ? 
                                    <div className="center-align">
                                        <Loader />
                                    </div>

                                    :

                                    <p className="center-align">
                                    <button className="btn waves-effect yellow darken-4 bold btnContinuar"
                                    onClick={this.submitData}
                                    >
                                        <i className="material-icons right">send</i> Ordenar
                                                </button>
                                </p>

                                }


                               

                            </div>
                        </li>

                    </ul>
                </div>
            </div>
        )
    }
}