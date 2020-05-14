import React,{Component} from 'react';
import firebase from 'firebase'
import {CartInfo} from './hooks/hooksCart'
import {Link} from 'react-router-dom';

class CartItems extends Component {

    state={
        user:false,
        carga:false
    }

    componentDidMount() {
        this.getUser();
    }

    getUser = () => {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user });
            }
        });
    }

    render(){
        let {user} = this.state;
        let {dataUser} = this.props;
        return(
            <div className="container">
            <div className="row itemsCart">
                {
                    user && dataUser ? 
                    <CartInfo user={user} dataUser={dataUser} presentacion="LIST" otro="otro" /> 
                    : null
                }
                {
                    !dataUser ?
                    <div className="col s12 centerContent valign-wrapper mt-1 ">
                        <div className="center-align w-100">
                        <Link to="/profile" className="pointer">Actualiza tu perfil de usuario para poder ver tu carrito.</Link>
                        </div>
                    </div>
                    : null
                }
            </div>
            </div>
        )
    }
}


export default CartItems;