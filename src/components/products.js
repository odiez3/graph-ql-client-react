import React, { Component } from 'react';
import firebase from 'firebase';
import { ListProducts, CategoriesDropDown } from './hooks/hooksProducts';


class Products extends Component {

    state = {
        idCategorie: "",
        catDesc: "",
    }

    componentDidMount() {
        this.getParameters();
    }

    static getDerivedStateFromProps(propsDerived, state) {
        debugger;
        let {props} = propsDerived;
        if (props.match && props.match.params) {
            let { idCategorie, catDesc } = props.match.params;
            if (idCategorie !== state.idCategorie) {

                return {
                    catDesc,
                    idCategorie
                }
            }
        }
        // Return null to indicate no change to state.
        return null;
    }

    getParameters = () => {
        if (this.props.match && this.props.match.params) {
            let { idCategorie } = this.props.match.params;
            if (idCategorie) {
                this.setState({ idCategorie });
            } else {
                this.setState({ idCategorie: "" });
            }
        } else {
            this.setState({ idCategorie: "" });
        }
    }

    render() {
        let {user} = this.props;
        let { idCategorie, catDesc } = this.state;
        return (
            <div className="row mt-1 productos">
                <div className="col s12">
                    <div className="col s12 m4 l2 left-align hide-on-med-and-down">
                        <a className='dropdown-trigger btn yellow darken-4' href='!#' data-target='dropCategories'>
                            <i className="material-icons right">expand_more</i>
                            Departamentos</a>
                        <CategoriesDropDown />
                    </div>

                    <div className="col s12 m12 l10 left-align">
                        <span className="light-blue-text text-darken-4 bold">
                            <i className="material-icons left bold">chevron_right</i>{catDesc}</span>
                    </div>
                    <div className="col s12 mt-1">
                        <div className="divider"></div>
                    </div>
                </div>
                <ListProducts idCategorie={idCategorie} user={user} />

            </div>
        )
    }
}


export default Products;