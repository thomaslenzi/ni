FROM kalilinux/kali-rolling

RUN touch ~/.hushlogin

RUN apt update 
# Tools
RUN apt install -y curl 
RUN apt install -y unzip 
RUN apt install -y jq 
RUN apt install -y git 
RUN apt install -y figlet 
RUN apt install -y nano 
# Languages
RUN apt install -y golang 
RUN apt install -y python3 
RUN apt install -y python3-pip 
RUN apt install -y python3-venv 
RUN apt install -y ruby 
RUN apt install -y php 
# Apps
RUN apt install -y netcat-traditional
RUN apt install -y seclists 
RUN apt install -y whois 
RUN apt install -y subfinder 
RUN apt install -y assetfinder 
RUN apt install -y httpx-toolkit 
RUN apt install -y dnsutils 
RUN apt install -y ffuf 
RUN apt install -y whatweb 
RUN apt install -y wafw00f
RUN apt install -y wpscan 
RUN apt install -y hydra 
RUN apt install -y dnsenum 
RUN apt install -y finalrecon 
RUN apt install -y nuclei 
RUN apt install -y sqlmap

# Files
RUN mkdir -p /opt/lists
RUN mkdir -p /opt/apps
RUN mkdir -p /data

# Subzy
RUN go install -v github.com/PentestPad/subzy@latest

# Rockyou
RUN curl -L -o /opt/lists/rockyou.txt https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt

# Username Anarchy
RUN cd /opt/apps && git clone https://github.com/urbanadventurer/username-anarchy.git

# Psudohash
RUN cd /opt/apps && git clone https://github.com/t3l3machus/psudohash.git
RUN cd /opt/apps/psudohash/ && python3 -m venv venv && ./venv/bin/pip3 install tqdm

# WhatWaf
RUN cd /opt/apps && git clone https://github.com/ekultek/whatwaf.git
RUN cd /opt/apps/whatwaf/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# Scrapy
RUN mkdir /opt/apps/scrapy
RUN cd /opt/apps/scrapy/ && python3 -m venv venv && ./venv/bin/pip3 install scrapy

# XSStrike
RUN cd /opt/apps && git clone https://github.com/s0md3v/XSStrike.git
RUN cd /opt/apps/XSStrike/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# XXEInjector
RUN cd /opt/apps && git clone https://github.com/enjoiz/XXEinjector.git

# Graphw00f
RUN cd /opt/apps && git clone https://github.com/dolevf/graphw00f.git
RUN cd /opt/apps/graphw00f/ && python3 -m venv venv && ./venv/bin/pip3 install requests

# GraphqlCop  
RUN cd /opt/apps && git clone https://github.com/dolevf/graphql-cop.git
RUN cd /opt/apps/graphql-cop/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt

# Graphqlmap
RUN cd /opt/apps && git clone https://github.com/swisskyrepo/GraphQLmap.git
RUN cd /opt/apps/GraphQLmap/ && echo -n "pyreadline\nrequests" > requirements.txt && python3 -m venv venv && ./venv/bin/pip3 install setuptools && ./venv/bin/pip3 install -r requirements.txt && ./venv/bin/python3 setup.py install

# Apps
COPY ./apps/cupp /opt/apps/cupp
COPY ./apps/scrapy /opt/apps/scrapy
