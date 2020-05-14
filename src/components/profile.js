import React, { Component } from 'react';
import M from 'materialize-css';
import firebase from 'firebase';
import {PersonalData} from './hooks/hooksUsers';


class Profile extends Component {

    state={
        userData: false
    }

    componentDidMount(){
       
        M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
        this.getUserData()
    }

    getUserData = () => {
        firebase.auth().onAuthStateChanged((user)=>{
            if(user){
                this.setState({userData:user});
            }
        })
    }

    render() {
        let {userData} = this.state;
        return (
            <div className="container profile">
                <div className="row">            
                    <div className="col s12">
                        <ul className="collapsible">
                            <li className="active">
                                <div className="collapsible-header"><i className="material-icons">person_outline</i>Datos Personales</div>
                                <div className="collapsible-body">
                                    {
                                        userData ? 
                                        <PersonalData user={userData} form="PERSONAL"/>: null
                                    }
                                </div>
                            </li>
                            <li>
                                <div className="collapsible-header"><i className="material-icons">place</i>Datos de Entrega</div>
                                <div className="collapsible-body">
                                    {
                                        userData ? 
                                        <PersonalData user={userData} form="DELIVER"/>: null
                                    }
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }

}

export default Profile;