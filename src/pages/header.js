import React from 'react';
import Catt from '../images/imgPublic/logom.gif'
import test from '../images/imgPublic/Thumbnail.jpg'
import "./css/header.css"
const Header = () => {
    return (
        <div class="header">
            <div class="grid view">
                <div class="header-contanier">
                    <div class="header-top">

                    </div>
                    <div class="header-bottom">
                        <div class="header-logo">
                            <img src={Catt} href="#" />
                        </div>
                        <div class="name">
                            <div class="nameuser">
                                tesst
                            </div>
                            <div class="avatar-user">
                                <img class="avatar-uimg" src={test} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default Header;