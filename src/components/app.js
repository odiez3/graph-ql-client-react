import React, { Component,useState } from 'react';
import firebase from 'firebase';
import { Switch, Route } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import {CHECK_DATAUSER} from './hooks/hooksUsers';
import './app.css';

import Nav from './nav';


/**Component */
import Login from './login';

import Products from './products';
import Profile from './profile';
import CartItems from './cart';
import ProductDetail from './productDetail';
import DeliverInfo from './deliverAdress';

import { Orders } from './hooks/hooksOrders';

export default function HookLogin(props){
    const [user,setUser]= useState(false)

    if(!user){
        firebase.auth().onAuthStateChanged((user)=>{
            
            if(user){
                user.getIdToken(true).then((token)=>{
                    localStorage.setItem("token",token);
                });
               setUser(user);  
            }else{
                localStorage.removeItem("token");
                setUser(false);  
            }
           
        })
    }
   
    return <PreAPP user={user}  />

}

const PreAPP = (props) =>{
    let { user} = props;
    let { data } = useQuery(CHECK_DATAUSER, {
        variables: { email: user.email },
    });
    let dataUser = false;
    if (data && data.user) {
        dataUser = data.user;
    }

    return <App user={user} dataUser={dataUser } />
}


class App extends Component {

    state={
        user:false,
        dataUser: false
    }

    componentDidUpdate(prevProps){
        if(this.props.dataUser !== prevProps.dataUser){
            this.setState({dataUser:this.props.dataUser});
        }
        if(this.props.user !== prevProps.user){
            this.setState({user:this.props.user});
        }
    }


    signOut=()=>{
        firebase.auth().signOut().then((r)=>{
            this.setState({user:false},()=>{
                localStorage.removeItem("token");
            })
        })
    }

    render() {
        let {user,dataUser} = this.state;
        return (

            <Switch>
                <div>
                    <Nav user={user} dataUser={dataUser}  signOut={this.signOut}/>
                    <div>
                        <Route exact path="/orders/:idOrder?" render={(props)=>!user  ? <Login /> :  <Orders props={props} user={user} dataUser={dataUser}/>}  />
                        <Route exact path="/profile" component={!user ? Login : Profile}  />
                        <Route exact path="/login" render={(props)=> !user  ? <Login /> : <Products props={props} user={user} />}  />
                        <Route exact path="/cart" render={(props)=> !user  ? <Login /> : <CartItems props={props} user={user} dataUser={dataUser}/>}  />
                        <Route exact path="/deliverAdress" render={(props)=>!user  ? <Login /> :  <DeliverInfo props={props} user={user} dataUser={dataUser}/>}  />
                        <Route exact path="/productDetail/:idProduct" render={(props)=>!user  ? <Login /> : <ProductDetail props={props} user={user} dataUser={dataUser}/>}  />
                        <Route exact path="/products/:idCategorie/:catDesc" render={(props)=> !user  ? <Login /> :  <Products props={props} user={user} />} />
                        <Route exact path="/" render={(props)=> !user  ? <Login /> : <Products props={props} user={user} />} />
                    </div>

                </div>
            </Switch >

        )
    }
}

//export default App;