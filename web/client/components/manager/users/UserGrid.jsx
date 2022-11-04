/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import UserCard from './UserCard';
import PropTypes from 'prop-types';
import Spinner from 'react-spinkit';
import Message from '../../I18N/Message';
import { getMessageById } from '../../../utils/LocaleUtils';

class UsersGrid extends React.Component {
    static propTypes = {
        loadUsers: PropTypes.func,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
        myUserId: PropTypes.number,
        fluid: PropTypes.bool,
        users: PropTypes.array,
        loading: PropTypes.bool,
        bottom: PropTypes.node,
        colProps: PropTypes.object
    };

    static contextTypes = {
        messages: PropTypes.object
    };

    static defaultProps = {
        loadUsers: () => {},
        onEdit: () => {},
        onDelete: () => {},
        fluid: true,
        colProps: {
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
            style: {
                "marginBottom": "20px"
            }
        }
    };

    componentDidMount() {
        this.props.loadUsers();
    }

    renderLoading = () => {
        if (this.props.loading) {
            return (<div style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                overflow: "visible",
                margin: "auto",
                verticalAlign: "center",
                left: "0",
                background: "rgba(255, 255, 255, 0.5)",
                zIndex: 2
            }}><div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -40%)"
                }}><Message msgId="loading" /><Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/></div></div>);
        }
        return null;
    };

    renderUsers = (users) => {
        return users.map((user) => {
            let actions = [{
                onClick: () => {this.props.onEdit(user); },
                glyph: "wrench",
                tooltip: getMessageById(this.context.messages, "users.editUser")
            }];
            if ( user && user.role === "GUEST") {
                actions = [];
            } else if (user.id !== this.props.myUserId) {
                actions.push({
                    onClick: () => {this.props.onDelete(user && user.id); },
                    glyph: "remove-circle",
                    tooltip: getMessageById(this.context.messages, "users.deleteUser")
                });
            }

            return <Col key={"user-" + user.id} {...this.props.colProps}><UserCard user={user} actions={actions}/></Col>;
        });
    };

    render() {
        return (
            <Grid style={{position: "relative"}} fluid={this.props.fluid}>
                {this.renderLoading()}
                <Row key="users">
                    {this.renderUsers(this.props.users || [])}
                </Row>
                {this.props.bottom}
            </Grid>
        );
    }
}

export default UsersGrid;
