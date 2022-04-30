/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2022, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////

define('pgadmin.user_management.current_user', [], function() {
    return {
        'id': 1,
        'email': 'nando@iglesias.corp',
        'is_admin': true,
        'name': 'nando',
        'allow_save_password': true,
        'allow_save_tunnel_password': false,
        'auth_sources': ['internal'],
        'current_auth_source': 'internal'
    }
});