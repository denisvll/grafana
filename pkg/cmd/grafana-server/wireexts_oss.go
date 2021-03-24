// +build wireinject,oss

package main

import (
	"github.com/google/wire"
	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/services/licensing"
)

var wireExtsSet = wire.NewSet(
	wireSet,
	licensing.ProvideService,
	wire.Bind(new(models.Licensing), new(*licensing.OSSLicensingService)),
	provideAPI,
)

type extensionsAPI struct {
}

func (a *extensionsAPI) Run() error {
	return nil
}

func provideAPI() *extensionsAPI {
	return &extensionsAPI{}
}
