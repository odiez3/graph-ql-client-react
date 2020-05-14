import React, { useState } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import M from 'materialize-css';


const GET_ESTADOS = gql`
query{
  estados:getEstados{
    _id
    nameEdo
  }
}
`

const GET_MUNICIPIOS = gql`
query getMunicipios($estado:String!){
  municipios:getMunicipiosByEstado(estado:$estado){
    _id
    nameMuni
    edo{
      _id
      nameEdo
    }
  }
}
`


export const AutoCompleteEdos = (props) => {

    let { data, loading } = useQuery(GET_ESTADOS);
    debugger;
    if (loading) return null

    if (data && data.estados) {
        let estados = {}
        for (let edo of data.estados) {
            estados[edo.nameEdo] = null
        }

        M.Autocomplete.init(document.querySelectorAll('.edoAuto'), {
            data: estados,
            onAutocomplete: (ev) => {
                let similar = checkValidEstate(ev);
                console.log("SO;", similar)
                sendValue({ desc: ev, state: similar });
            }
        });

        M.updateTextFields();
    }

    function sendValue({ desc, state }) {
        setTimeout(() => {
            props.onChange({ desc, state });
        }, 400)

    }

    function checkValidEstate(v) {
        let similar = data.estados.filter((value, index) => {
            if (value.nameEdo.trim().toLowerCase() === v.trim().toLowerCase()) {
                return value;
            }
        });
        return similar.length ? similar[0]._id : false;
    }

    return (<div className={props.class}>
        <input type="text" id="userState" className="autocomplete edoAuto" autoComplete="off" value={props.value}
            onChange={(event) => {
                let { value } = event.target;
                let similar = checkValidEstate(value);

                console.log(similar);
                props.onChange({ desc: value, state: similar });
            }}
        />
        <label htmlFor="userState">Estado {props.required ? "*" : null}</label>
    </div>)

}


export const AutoCompleteMunicipio = (props) => {

    console.log(props);

    let { data, loading } = useQuery(GET_MUNICIPIOS, { variables: {estado:props.estado} });

    console.log("DataMUNI", data);
    if (data && data.municipios) {
        let municipios = {}
        for (let edo of data.municipios) {
            municipios[edo.nameMuni] = null
        }

        M.Autocomplete.init(document.querySelectorAll('.autocompleteMuni'), {
            data: municipios,
            onAutocomplete: (ev) => {
                let similar = checkValidMuni(ev);
                debugger;
                if(similar){
                    sendValue({ desc: ev, muni:similar });
                }else{
                    sendValue({ desc: ev, muni:false });
                }
               
            }
        });

        M.updateTextFields()
    }

    function sendValue({ desc,muni }) {
        setTimeout(() => {
            props.onChange({ desc, muni });
        }, 400)

    }

    function checkValidMuni(v) {
        let similar = data.municipios.filter((value, index) => {
            if (value.nameMuni.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
             v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) {
                return value;
            }
        });

        return similar.length ? similar[0] : false;
    }

    return (<div className={props.class}>
        <input type="text" id="i" className="autocompleteMuni" autoComplete="off" value={props.value}
            onChange={(event) => {
                let { value } = event.target;
                let similar = checkValidMuni(value);
                if(similar){
                    props.onChange({ desc: value, muni:similar });
                }else{
                    props.onChange({ desc: value, muni:false });
                }
              
            }}
        />
        <label htmlFor="i">Ciudad / Municipio {props.required ? "*" : null}</label>
    </div>)

}