import React, { Component } from 'react';
import firebase from 'firebase';
import Loader from '../commons/loader';
import M from 'materialize-css';
import googleIcon from '../assets/google.png';



class Login extends Component {


    state = {
        correo: "",
        password: "",
        isSignin: false
    }


    changeValues = (event) => {
        let { value, id } = event.target;
        this.setState({ [id]: value });
    }

    submitData = (event) => {
        event.preventDefault();
        this.setState({ isSignin: true }, () => {
            let { correo, password } = this.state;

            if (correo.trim() !== "" && password.trim() !== "") {

                firebase.auth().signInWithEmailAndPassword(correo, password).then((user) => {
                    if (user) {
                        this.props.history.push('/');
                    }
                }).catch((error) => {
                    console.log(error);
                    this.setState({ isSignin: false });

                    if (error.code === "auth/wrong-password") {
                        M.toast({ html: "Contraseña incorrecta.", classes: "red darken-2" }); this.setState({ isSignin: false });
                    } else if (error.code === "auth/user-not-found") {
                        M.toast({ html: "El correo electrónico no se encuentra registrado.", classes: "red darken-2" });
                    } else if (error.code === "auth/invalid-email") {
                        M.toast({ html: "Capture un correo electrónico válido.", classes: "red darken-2" });
                    }
                });
            } else {
                M.toast({ html: "Capture su correo elctrónico y contraseña.", classes: "red darken-2" });
                this.setState({ isSignin: false });
            }

        })

    }

    googleProvider = () => {
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            //var token = result.credential.accessToken;
            // The signed-in user info.
            var user = result.user;

            try{
              let token= user.getIdToken(true);
              localStorage.setItem("token",token);
              
            }catch(error){
                console.log(error);
            }

            this.setState({ user }, () => {
                this.props.history.push('/');
            });

            
            // ...
        }).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            // var errorMessage = error.message;
            // The email of the user's account used.
            //  var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            // var credential = error.credential;
            // ...
            console.log(errorCode);
            M.toast({ html: error.message, classes: "red darken-2" });
        });
    }

    render() {
        let { correo, password, isSignin } = this.state;
        return (
            <div className="login container">
                <div className="row">
                    <div className="col s12">
                        <div className="card">
                            <div className="card-content row">
                                <span className="card-title">Iniciar sesión</span>
                                <div className="divider" />

                                <div className="col s12 m12 l6 xl6 formInicioSesion valign-wrapper ">
                                    <form className="row w-100" onSubmit={this.submitData}>
                                        <div className="col s12 left-align">
                                            <span className="card-title">Ingresa con tu correo electrónico.</span>
                                        </div>
                                        <div className="input-field col s12">
                                            <i className="material-icons prefix  yellow-text text-darken-4">email</i>
                                            <input id="correo" type="text" onChange={this.changeValues} value={correo} />
                                            <label htmlFor="correo">Correo electrónico:</label>
                                        </div>
                                        <div className="input-field col s12">
                                            <i className="material-icons prefix  yellow-text text-darken-4">vpn_key</i>
                                            <input id="password" type="password"
                                            onChange={this.changeValues} value={password} />
                                            <label htmlFor="password">Contraseña:</label>
                                        </div>
                                        <div className="col s12 center-align">
                                            <a href="#hef">¿Olvidaste tu contraseña?</a>
                                        </div>
                                        <div className="col s12 center-align">
                                            {
                                                !isSignin ?
                                                    <button className="btn waves-effect yellow darken-4 w-100 mt-1">Entrar</button>
                                                    :
                                                    <Loader />
                                            }

                                        </div>
                                    </form>
                                </div>
                                <div className="col s12 m12 l6 xl6 formInicioSesionRedes valign-wrapper">
                                    <div className="row w-100">
                                        <div className="col s12 center-align">
                                            <button className="btn-flat waves-effect w-100 yellow-text text-darken-4"
                                                onClick={this.googleProvider}
                                            >
                                                <img src={googleIcon} className="right imgIcon" alt="Google" />
                                            Continuar con Google</button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Login;