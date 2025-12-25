FROM kalilinux/kali-rolling

# Filesystem setup
RUN mkdir -p /opt/lists /opt/apps /data

# Common packages
RUN apt update
RUN apt install -y curl unzip jq git figlet
RUN apt install -y golang python3 python3-pip python3-venv ruby php

## Lists
RUN git clone --depth 1 https://github.com/danielmiessler/SecLists.git /opt/lists/seclists
RUN curl -L -o /opt/lists/rockyou.txt https://github.com/brannondorsey/naive-hashcat/releases/download/data/rockyou.txt
RUN git clone --depth 1 https://github.com/imsky/wordlists.git /opt/lists/wordlists

# Bruteforce
RUN apt install -y hydra
RUN go install github.com/ffuf/ffuf/v2@latest
RUN git clone --depth 1 https://github.com/t3l3machus/psudohash.git /opt/apps/psudohash && cd /opt/apps/psudohash/ && python3 -m venv venv && ./venv/bin/pip3 install tqdm
COPY ./apps/cupp /opt/apps/cupp
RUN git clone --depth 1 https://github.com/urbanadventurer/username-anarchy.git /opt/apps/username-anarchy

# Domains
RUN apt install -y whois bind9-dnsutils dnsrecon dnsenum
RUN git clone --depth 1 https://github.com/thewhiteh4t/FinalRecon.git /opt/apps/finalrecon && cd /opt/apps/finalrecon/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt
RUN go install github.com/projectdiscovery/httpx/cmd/httpx@latest
RUN go install github.com/PentestPad/subzy@latest
RUN go install github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
RUN go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
RUN go install github.com/tomnomnom/assetfinder@latest

# Web
RUN apt install -y wpscan whatweb netcat-traditional
RUN git clone --depth 1 https://github.com/dolevf/graphw00f.git /opt/apps/graphw00f && cd /opt/apps/graphw00f/ && python3 -m venv venv && ./venv/bin/pip3 install requests
RUN git clone --depth 1 https://github.com/dolevf/graphql-cop.git /opt/apps/graphql-cop && cd /opt/apps/graphql-cop/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt
RUN git clone --depth 1 https://github.com/swisskyrepo/GraphQLmap.git /opt/apps/graphqlmap && cd /opt/apps/graphqlmap/ && echo "pyreadline" > requirements.txt && echo "requests" >> requirements.txt && python3 -m venv venv && ./venv/bin/pip3 install setuptools && ./venv/bin/pip3 install -r requirements.txt && ./venv/bin/python3 setup.py install
COPY ./apps/scrapy /opt/apps/scrapy
RUN cd /opt/apps/scrapy/ && python3 -m venv venv && ./venv/bin/pip3 install scrapy
RUN git clone --depth 1 https://github.com/sqlmapproject/sqlmap.git /opt/apps/sqlmap && cd /opt/apps/sqlmap/ && python3 -m venv venv
RUN mkdir /opt/apps/wafw00f && cd /opt/apps/wafw00f/ && python3 -m venv venv && ./venv/bin/pip3 install wafw00f
RUN git clone --depth 1 https://github.com/ekultek/whatwaf.git /opt/apps/whatwaf && cd /opt/apps/whatwaf/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt
RUN git clone --depth 1 https://github.com/s0md3v/XSStrike.git /opt/apps/xsstrike && cd /opt/apps/xsstrike/ && python3 -m venv venv && ./venv/bin/pip3 install -r requirements.txt
RUN git clone --depth 1 https://github.com/enjoiz/XXEinjector.git /opt/apps/xxeinjector

RUN apt install -y chromium
