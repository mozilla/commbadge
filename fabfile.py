import os

from fabric.api import env, execute, lcd, local, parallel, roles, task
import fabdeploytools.envs
from fabdeploytools import helpers

import deploysettings as settings

env.key_filename = settings.SSH_KEY
fabdeploytools.envs.loadenv(os.path.join('/etc/deploytools/envs',
                                         settings.CLUSTER))
COMMBADGE = os.path.dirname(__file__)
ROOT = os.path.dirname(COMMBADGE)


@task
def pre_update(ref):
    with lcd(COMMBADGE):
        local('git fetch')
        local('git fetch -t')
        local('git reset --hard %s' % ref)


@task
def update():
    with lcd(COMMBADGE):
        local('npm install')
        local('node_modules/.bin/bower update --allow-root')
        local('make update')
        local('cp src/media/js/settings_local_hosted.js src/media/js/settings_local.js')

        local('make build')
        local('node_modules/.bin/commonplace langpacks')


@task
@roles('web')
@parallel
def _install_package(rpmbuild):
    rpmbuild.install_package()


@task
def deploy():
    with lcd(COMMBADGE):
        ref = local('git rev-parse HEAD', capture=True)

    rpmbuild = helpers.deploy(name='commbadge',
                              env=settings.ENV,
                              cluster=settings.CLUSTER,
                              domain=settings.DOMAIN,
                              root=ROOT,
                              deploy_roles=['web'],
                              package_dirs=['commbadge'])
