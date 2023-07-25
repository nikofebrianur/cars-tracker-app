<p align="center">
  <a href="https://kba.ai/">
    <img alt="KBA" src="https://kba.ai/wp-content/uploads/2020/09/KBA_450x50-.png" width="300">
  </a>
</p>

<p align="center">
A Sample prototype application for managing automobile details backed by Hyperledger fabric
</p>

## Installation

### Installing Basic Dependencies

To install the basic dependencies such as node, npm, jq, sponge and docker, navigate to Networks folder and execute the command

```bash
$ ./installDependencies.sh
```
Once the installation is complete, restart the machine.

### Installing Minifab Binary

```bash
$ ./installDependencies.sh bin
```
## Starting the network

Make sure you have installed all the dependencies before following this step, to start the network we have provided a script available inside the Network folder

```bash
$ ./startNetwork.sh
```

