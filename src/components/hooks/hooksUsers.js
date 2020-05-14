import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';
import { gql } from 'apollo-boost';
import M from 'materialize-css';
import Loader from '../../commons/loader';
import superBack from '../../assets/superMarket.jpg'
import { AutoCompleteEdos, AutoCompleteMunicipio } from './hooksLocations';



export const CHECK_DATAUSER = gql`
    query checkDataInDB{
    user:checkDataInDB{
      _id
      userFirstName,
      userLastName,
      userEmail,
      userPhone,
      userCity,
      citySelected{
        nameMuni,
        _id,
        edo{
            _id
        }
      },
      userState,
      stateSelected{
        nameEdo,
        _id
        }
      userNoExt,
      userNoInt,
      userZip,
      userAddress,
      userAddress2
    }
  }
`;

const UPDATE_USER = gql`
mutation updatePersonalData($user:PersonalDataInput!){
  savePersonalData(user:$user){
    _id
    userLastName
  }
}
`;


const UPDATE_DELIVER = gql`
mutation updateDeliverData($user:DeliverDataInput!){
    saveDeliverData(user:$user){
    _id
    userLastName
  }
}
`;

const USERINFO_SUBS = gql`
  subscription userInfo($email:String!){
  userInfo(email:$email){
    userUID,
    userLastName,
    userFirstName
  }
}
`;

export const PersonalCard = (props) => {
    let { user,dataUser } = props;

    let dataInfo = useSubscription(
        USERINFO_SUBS,
        { variables: { email: props.user.email } }
    );

    let dataFromSub = dataUser;

    if (dataInfo.data && dataInfo.data.userInfo) {
        dataFromSub = dataInfo.data.userInfo;
    } 


    let userData = dataFromSub;

    return (
        <li>
            <div className="user-view">
                <div className="background">
                    <img src={superBack} alt="USER" />
                </div>

                <Link to="/profile" className="sidenav-close"><span className="white-text name">{
                    userData && userData.userFirstName ? `${userData.userFirstName} ${userData.userLastName || ""}` : "Actualiza tu Perfil"
                }</span></Link>
                <Link to="/profile" className="sidenav-close"><span className="white-text email">{user.email}</span></Link>
            </div>
        </li>
    )
}


export const PersonalData = (props) => {
    let { form } = props;
    let { loading, data, refetch } = useQuery(CHECK_DATAUSER, {
        variables: { email: props.user.email },
    });

    let dataUser = {};

    if (data && data.user) {
        dataUser = data.user;
    }

    if (loading) return <Loader />

    if (form === "PERSONAL") {
        return <PersonalDataForm data={dataUser} userSession={props.user} refetch={refetch} />
    } else {
        return <DeliverDataForm data={dataUser} userSession={props.user} refetch={refetch} />
    }

}

const PersonalDataForm = (props) => {
    let { data, userSession, refetch } = props;
    const [userData, setUserData] = useState({
        userEmail: userSession.email,
        userUID: userSession.uid,
        userFirstName: data.userFirstName || "",
        userLastName: data.userLastName || "",
        userPhone: data.userPhone || ""
    });

    const [updateUser] = useMutation(UPDATE_USER);
    const [loader, setLoader] = useState(false);

    setTimeout(() => {
        M.updateTextFields();
    }, 50)

    return (
        <div className="row">
            <form className="col s12" onSubmit={async (event) => {
                event.preventDefault();
                setLoader(true);

                if (
                    userData.userFirstName.trim() !== "" &&
                    userData.userLastName.trim() !== "" &&
                    userData.userPhone.trim() !== ""
                ) {
                    try {
                        await updateUser({
                            variables: {
                                user: {
                                    userEmail: userData.userEmail,
                                    userUID: userData.userUID,
                                    userFirstName: userData.userFirstName,
                                    userLastName: userData.userLastName,
                                    userPhone: userData.userPhone
                                }
                            }
                        });
                        refetch();
                        M.toast({ html: "Se actualizarón los datos correctamente.", classes: "green darken-2" });
                        setLoader(false);
                    } catch (error) {
                        M.toast({ html: "Ocurrio un error al intengar guardar los datos intente nuevamente.", classes: "red darken-2" });
                        setLoader(false);
                    }

                } else {
                    M.toast({ html: "Capture los campos obligatorios. (*)", classes: "red darken-2" });
                    setLoader(false);
                }


            }}>
                <div className="row">
                    <div className="input-field col s12 m6 l6">

                        <input id="userFirstName" value={userData.userFirstName}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userFirstName: value });
                            }}
                            type="text" />
                        <label htmlFor="userFirstName">Nombre: *</label>
                    </div>
                    <div className="input-field col s12 m6 l6">
                        <input id="userLastName" value={userData.userLastName}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userLastName: value });
                            }}
                            type="text" />
                        <label htmlFor="userLastName">Apellidos: *</label>
                    </div>
                    <div className="input-field col s12 m6 l6">
                        <input id="userPhone" value={userData.userPhone}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userPhone: value });
                            }}
                            type="text" max-length="10" />
                        <label htmlFor="userPhone">Telefono: *</label>
                    </div>
                    <div className="col s12 left-align">
                        <label>Campos obligatorios (*)</label>
                    </div>

                    <div className="col s12 center-align mt-1">
                        {
                            loader ?
                                <Loader />
                                :
                                <button className="btn green darken-1"><i className="material-icons right">send</i>Guardar</button>
                        }

                    </div>
                </div>
            </form>
        </div>
    )
}


const DeliverDataForm = (props) => {

    let { data, userSession, refetch } = props;

    const [userData, setUserData] = useState({
        userEmail: userSession.email,
        userUID: userSession.uid,
        userCity: data.userCity || data.citySelected ? data.citySelected.nameMuni : "",
        userState: data.userState || data.stateSelected ? data.stateSelected.nameEdo : "",
        userNoExt: data.userNoExt || "",
        userNoInt: data.userNoInt || "",
        userZip: data.userZip || "",
        userAddress: data.userAddress || "",
        userAddress2: data.userAddress2 || "",
        stateSelected: data.stateSelected ? data.stateSelected._id : false,
        muniSelected: data.citySelected ? data.citySelected : false
    });

    const [updateDeliver] = useMutation(UPDATE_DELIVER);
    const [loader, setLoader] = useState(false);

    setTimeout(() => {
        M.updateTextFields();
    }, 50)

    return (
        <div className="row">
            <form className="col s12" onSubmit={async (event) => {
                event.preventDefault();
                setLoader(true);
                debugger
                if (!userData.stateSelected) {
                    M.toast({ html: "No contamos con cobertura para este estado o municipio.", classes: "red darken-2" });
                    setLoader(false);
                } else if (!userData.muniSelected || (userData.stateSelected !== userData.muniSelected.edo._id)) {
                    M.toast({ html: `Seleccione un muinicipio del estado de ${userData.userState}`, classes: "red darken-2" });
                    setLoader(false);
                }
                else {
                    debugger;
                    if (
                        userData.userCity.trim() !== "" &&
                        userData.userState.trim() !== "" &&
                        userData.stateSelected && userData.muniSelected &&
                        userData.userZip.trim() !== "" &&
                        userData.userNoExt.trim() !== "" &&
                        userData.userAddress !== ""
                    ) {

                        try {
                            await updateDeliver({
                                variables: {
                                    user: {
                                        userEmail: userData.userEmail,
                                        userUID: userData.userUID,
                                        userCity: userData.userCity,
                                        citySelected: userData.muniSelected._id,
                                        userState: userData.userState,
                                        stateSelected: userData.stateSelected,
                                        userZip: userData.userZip,
                                        userNoExt: userData.userNoExt,
                                        userNoInt: userData.userNoInt,
                                        userAddress: userData.userAddress,
                                        userAddress2: userData.userAddress2
                                    }
                                }
                            });
                            refetch();
                            M.toast({ html: "Se actualizarón los datos correctamente.", classes: "green darken-2" });
                            setLoader(false);
                        } catch (error) {
                            M.toast({ html: "Ocurrio un error al intengar guardar los datos intente nuevamente.", classes: "red darken-2" });
                            setLoader(false);
                        }

                    } else {
                        M.toast({ html: "Capture los campos obligatorios. (*)", classes: "red darken-2" });
                        setLoader(false);
                    }
                }
            }}>
                <div className="row">
                    <AutoCompleteEdos class="input-field col s12 m6 l6" required={true}
                        value={userData.userState}
                        onChange={(value) => {
                            setUserData({ ...userData, userState: value.desc, stateSelected: value.state });
                        }}
                    />

                    <AutoCompleteMunicipio class="input-field col s12 m6 l6" required={true}
                        value={userData.userCity}
                        estado={userData.stateSelected} value={userData.userCity}
                        onChange={(value) => {
                            debugger;
                            setUserData({ ...userData, userCity: value.desc, muniSelected: value.muni });
                        }}
                    />

                    <div className="input-field col s12 m6 l6">
                        <input id="userZip" value={userData.userZip}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userZip: value });
                            }}
                            type="text" max-length="5" />
                        <label htmlFor="userZip">Código Postal: *</label>
                    </div>
                    <div className="input-field col s6 m3 l3">
                        <input id="userNoExt" value={userData.userNoExt}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userNoExt: value });
                            }}
                            type="text" max-length="5" />
                        <label htmlFor="userNoExt">No. Exterior: *</label>
                    </div>
                    <div className="input-field col s6 m3 l3">
                        <input id="userNoInt" value={userData.userNoInt}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userNoInt: value });
                            }}
                            type="text" max-length="5" />
                        <label htmlFor="userNoInt">No. Interior:</label>
                    </div>
                    <div className="input-field col s12">
                        <input id="userAddress" value={userData.userAddress}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userAddress: value });
                            }}
                            type="text" max-length="5" />
                        <label htmlFor="userAddress">Dirección Línea 1: *</label>
                    </div>
                    <div className="input-field col s12">
                        <input id="userAddress2" value={userData.userAddress2}
                            onChange={(event) => {
                                let value = event.target.value;
                                setUserData({ ...userData, userAddress2: value });
                            }}
                            type="text" max-length="5" />
                        <label htmlFor="userAddress2">Dirección Línea 2:</label>
                    </div>
                    <div className="col s12 left-align">
                        <label>Campos obligatorios (*)</label>
                        <p><label><span className="red-text text-darken-4">Nota:</span> Si tu estado o municipio no se ecuentra es debido a que aún no contamos con cobertura.</label></p>
                    </div>

                    <div className="col s12 center-align mt-1">
                        {
                            loader ?
                                <Loader />
                                :
                                <button className="btn green darken-1"><i className="material-icons right">send</i>Guardar</button>
                        }

                    </div>
                </div>
            </form>
        </div >
    )
}