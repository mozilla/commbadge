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

if settings.ZAMBONI_DIR:
    helpers.scl_enable('python27')
    ZAMBONI = '%s/zamboni' % settings.ZAMBONI_DIR
    ZAMBONI_PYTHON = '%s/venv/bin/python' % settings.ZAMBONI_DIR

os.environ['DJANGO_SETTINGS_MODULE'] = 'settings_local_mkt'


@task
def pre_update(ref):
    with lcd(COMMBADGE):
        local('git fetch')
        local('git fetch -t')
        local('git reset --hard %s' % ref)


@task
def build():
    with lcd(COMMBADGE):
        local('npm install')
        local('make install')
        local('cp src/media/js/settings_local_hosted.js '
              'src/media/js/settings_local.js')
        local('make build')
        local('node_modules/.bin/commonplace langpacks')


@task
def deploy_jenkins():
    rpm = helpers.build_rpm(name='commbadge',
                            env=settings.ENV,
                            cluster=settings.CLUSTER,
                            domain=settings.DOMAIN,
                            root=ROOT)

    rpm.local_install()
    rpm.remote_install(['web'])

    deploy_build_id('commbadge')


@task
def update():
    with lcd(COMMBADGE):
        local('npm install')
        local('make install')
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


@task
def deploy_build_id(app):
    with lcd(ZAMBONI):
        local('%s manage.py deploy_build_id %s' %
              (ZAMBONI_PYTHON, app))
