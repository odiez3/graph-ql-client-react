import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import M from 'materialize-css';
import { ListCategories } from './hooks/hooksProducts';
import { PersonalCard } from '../components/hooks/hooksUsers';
import { CartInfo } from '../components/hooks/hooksCart';



class Nav extends Component {

    state = {
        user: false
    }

    componentDidMount() {
        M.Sidenav.init(document.querySelectorAll('.sidenav'), {});
    }


    render() {

        let { user, signOut, dataUser } = this.props;
        return (
            <React.Fragment>
                <div className="navbar-fixed">
                    <nav>
                        <div className="nav-wrapper green darken-1">
                            <Link to="/" className="brand-logo">Logo</Link>
                            <ul id="nav-mobile" className="right">
                                {
                                    user && dataUser ?
                                        <CartInfo dataUser={dataUser} presentacion="NAVBAR" />
                                        : null
                                }
                                {
                                    !user ?
                                        <li className="hide-on-med-and-down">
                                            <Link to="/login">
                                                <i className="material-icons left">person_outline</i>Mi Cuenta
                                    </Link>
                                        </li>
                                        : null
                                }

                                <li data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <ul id="slide-out" className="sidenav">

                    {
                        user && dataUser?
                            <PersonalCard user={user} dataUser={dataUser}/>
                            : null
                    }


                    <li><Link to="/" className="sidenav-close">
                        <i className="material-icons left">home</i>Inicio
                        </Link></li>
                    <li><div className="divider"></div></li>
                    {
                        !user ?
                            <li>  <Link to="/login" className="sidenav-close">
                                <i className="material-icons left">person_outline</i>Mi Cuenta
                                </Link></li>
                            : null
                    }
                     {
                        user ? <ListCategories />

                        : null }
                    <li><div className="divider"></div></li>
                    {
                        user && dataUser ?
                            <React.Fragment>
                                <CartInfo dataUser={dataUser} presentacion="SIDENAV" />
                                <li><div className="divider"></div></li>
                            </React.Fragment>
                            : null
                    }

                    {
                        user && dataUser ?
                            <React.Fragment>
                                <li>  <Link to="/orders" className="sidenav-close">
                                    <i className="material-icons left">receipt</i>Mis Pedidos
                        </Link></li>
                                <li><div className="divider"></div></li>
                            </React.Fragment>
                            : null
                    }

                    {
                        user ?
                            <li>  <Link to="/profile" className="sidenav-close">
                                <i className="material-icons left">person_outline</i>Mi Perfil
                                </Link></li>
                            : null
                    }
                    {
                        user ?
                            <li>
                                <div className="btn yellow darken-4 waves-effect w-100 sidenav-close"
                                    onClick={() => {
                                        signOut();

                                    }}
                                >
                                    <i className="material-icons right">exit_to_app</i>Cerrar Sesión
                        </div>
                            </li>
                            : null
                    }

                </ul>
            </React.Fragment>
        )
    }

}


export default Nav;