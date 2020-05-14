import React from 'react';


const ConfirmModal = (props) => {
    return (
        <div id="modalConfirm" className="modal">
            <div className="modal-content">
                <h5 className="yellow-text text-darken-4">{props.header}</h5>
                <div className="divider"></div>
                <p className="bold">{props.content}</p>
                {
                    props.item ? 
                    <div className="row">
                       
                        <div className="col s6 bold right-align">
                         {`${props.item.quantity}  ${props.item.quantity > 1 ? "Piezas" : "Pieza"}`}  de  {props.item.product.productName}
                        </div>
                        <div className="col s6 center-align">
                             <img src={props.item.product.productImage} className="responsive-img" alt={props.item.product.productName}/>
                        </div>
                    </div>
                   
                    : null
                }
             
               <div className="divider"></div>
            </div>
            <div className="modal-footer">
                <button className="modal-close waves-effect waves-red btn-flat bold"
                onClick={()=>{
                    if(props.actionCancel){
                        props.actionCancel();
                    }
                }}
                >No</button>
                <button className="modal-close waves-effect waves-green btn-flat bold red-text text-darken-2"
                onClick={()=>{
                    if(props.actionDone){
                        props.actionDone(props.item)
                    }
                }}
                >Sí</button>
            </div>
        </div>
    )
}

export default ConfirmModal;