import React from 'react';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userToEdit: {},
            shouldEditRender: false,
            shouldStatusRender: false,
            statusType: "",
            updateFunc: null
        }

        this.handleEdit = this.handleEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.setShouldStatusRender = this.setShouldStatusRender.bind(this);
    }

    handleEdit(id, username, email, updateFunc) {
        this.setState({
            userToEdit: {
                id, username, email
            },
            shouldEditRender: true,
            updateFunc: updateFunc
        })
    }

    handleSave(id, username, email) {
        this.setShouldStatusRender(true, "update");

        this.state.updateFunc(id, username, email);

        this.setState({
            userToEdit: {},
            shouldEditRender: false,
            updateFunc: null
        });
    }

    handleClose() {
        this.setState({
            userToEdit: {},
            shouldEditRender: false,
            updateFunc: null
        });
    }

    setShouldStatusRender(shouldStatusRender, type) {
        if (shouldStatusRender) {
            this.setState({
                shouldStatusRender: true,
                statusType: type
            })
        }
        else {
            this.setState({
                shouldStatusRender: false,
                statusType: ""
            })
        }
    }

    render() {
        return (
          <div>
              {this.state.shouldStatusRender ? <Status type={this.state.statusType} /> : null}
              {this.state.shouldEditRender ?
                  <EditMenu
                      userToEdit={this.state.userToEdit}
                      handleSave={this.handleSave}
                      handleClose={this.handleClose}
                  /> : null}
              <Table
                  setShouldStatusRender={this.setShouldStatusRender}
                  handleEdit={this.handleEdit}
              />
          </div>
        );
    }
}

class Table extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
        };

        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.add = this.add.bind(this);
    }

    componentDidMount() {
        fetch('https://jsonplaceholder.typicode.com/users')
            .then(response => response.json())
            .then(json => {
                this.setState({
                    users: [
                        ...json.map(({id, username, email}) => {
                            return {id, username, email}
                        })
                    ]
                });
            });
    }

    add(username, email) {
        fetch(`https://jsonplaceholder.typicode.com/users`, {
            method: 'POST',
            body: JSON.stringify( {
                username: username,
                email: email
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            }
        })
            .then(response => response.json())
            .then(json => {
                this.setState({
                    users: [
                        ...this.state.users,
                        json
                    ]
                })
            });
    }

    update(id, username, email) {
        const users = this.state.users;

        fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                id: id,
                username: username,
                email: email,
            }),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        })
            .then(response => response.json())
            .then(({id, username, email}) => {
                this.setState({
                    users: users.map(user => {
                        return user.id !== id ? user :
                            {id: id, username: username, email: email};
                    })
                });
                this.props.setShouldStatusRender(false);
            });
    }

    delete(id) {
        const users = this.state.users;

        this.props.setShouldStatusRender(true, 'delete');

        fetch(`https://jsonplaceholder.typicode.com/users/${id}`, {
            method: 'DELETE'
        })
            .then(() => {
                this.setState({
                    users: users.filter(user => user.id !== id)
                });
                this.props.setShouldStatusRender(false);
            })
    }

    render() {
        const users = this.state.users;

        return (
            <table className="table">
                <thead className="table__head">
                    <tr className="table__row">
                        <th className="table__cell table__cell_type_heading">ID</th>
                        <th className="table__cell table__cell_type_heading">UserName</th>
                        <th className="table__cell table__cell_type_heading">Email</th>
                        <th className="table__cell table__cell_type_heading">Action</th>
                    </tr>
                </thead>
                <tbody className="table__body">
                    {users.map(({id, username, email}) => {
                        return (
                            <tr
                                key={id}
                                className="table__row"
                            >
                                <td className="table__cell table__cell_align_right table__cell_padding_right">{id}</td>
                                <td className="table__cell">{username}</td>
                                <td className="table__cell">{email}</td>
                                <td className="table__cell table__cell_align_center">
                                    <button onClick={() => this.delete(id)}>Delete!</button>
                                    <button
                                        onClick={() => this.props.handleEdit(id, username, email, this.update)}
                                    >
                                        Edit!
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }
}

class EditMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {
                ...this.props.userToEdit
            }
        }

        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
    }

    handleUserNameChange(event) {
        this.setState({
            user: {
                ...this.state.user,
                username: event.target.value
            }
        });
    }

    handleEmailChange(event) {
        this.setState({
            user: {
                ...this.state.user,
                email: event.target.value
            }
        });
    }

    render() {
        const {id, username, email} = this.state.user;

        return (
            <div className="edit-menu">
                <div className="edit-menu__container">
                    <div className="edit-menu__text-container">
                        <h1 className="edit-menu__h1">Edit</h1>
                        <h4 className="edit-menu__h4">ID: {id}</h4>
                    </div>
                    <div className="edit-menu__input-container">
                        <input
                            type="text"
                            className="edit-menu__input"
                            value={username}
                            onChange={this.handleUserNameChange}
                        />
                        <input
                            type="text"
                            className="edit-menu__input"
                            value={email}
                            onChange={this.handleEmailChange}
                        />
                    </div>
                    <div className="edit-menu__button-container">
                        <button
                            onClick={() => this.props.handleSave(id, username, email)}
                            className="button button_type_save"
                        >
                            Save
                        </button>
                        <button
                            onClick={this.props.handleClose}
                            className="button button_type_cancel"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

class Status extends React.Component{
    render() {
        const types = {
            delete: {
                modifier: "delete",
                text: "Deleting..."
            },
            add: {
                modifier: "add",
                text: "Adding..."
            },
            update: {
                modifier: "update",
                text: "Updating..."
            }
        }
        const currentType = types[this.props.type];
        const className = `status status_type_${currentType.modifier}`;

        return (
          <div className={className}>
              <p>{currentType.text}</p>
          </div>
        );
    }
}

export default App;