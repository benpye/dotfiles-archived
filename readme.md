dotfiles
========

A simple dotfiles script and the files I syncronise between different installations.

The dotfiles.js script requires a relatively recent version of NodeJS (v0.12.0+ I think), on Ubuntu this can be installed from their repo:

    curl --silent --location https://deb.nodesource.com/setup_0.12 | sudo bash -
	sudo apt install nodejs

The script supports symlinking, getting git repos, and using gsettings, though it could easily be expanded to support more.
