# ROULETTE

## SPIS TREŚCI

- [URUCHOMIENIE PROJEKTU](#uruchomienie-projektu)
- [UŻYTE TECHNOLOGIE / BIBLIOTEKI](#użyte-technologie-/-biblioteki)
- [FUNKCJONALNOŚCI](#funkcjonalności)
- [STATUS PROJEKTU](#status-projektu)
- [ZRZUTY EKRANU](#zrzuty-ekranu)

## URUCHOMIENIE PROJEKTU

- Aby uruchomić projekt, na porcie 7474 musi działać baza neo4j, z domyślnym loginem: neo4j i hasłem s3cr3t.
- Aby uruchomić backend, w folderze /backend należy wpisać ,,npm i'' lub ,,yarn install", następnie wpisać ,,node index.js''
- Aby uruchomić frontend w folderze /frontend należy wpisać ,,npm i'' lub ,,yarn install", następnie wpisać ,,npm start'' lub ,,yarn start''
- Aby uruchomić mqtt (dotyczy brokera HiveMQ) z websocketem na porcie 8000, należy podmienić konfigurację brokera z pliku config.xml na:

```
<?xml version="1.0"?>
<!--

    Copyright 2019-present HiveMQ GmbH

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->

<hivemq xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="../../hivemq-config.xsd">

    <listeners>

 <websocket-listener>
          <port>8000</port>
          <bind-address>0.0.0.0</bind-address>
          <path>/mqtt</path>
          <subprotocols>
              <subprotocol>mqttv3.1</subprotocol>
              <subprotocol>mqtt</subprotocol>
          </subprotocols>
          <allow-extensions>true</allow-extensions>
      </websocket-listener>

        <tcp-listener>
            <port>1883</port>
            <bind-address>0.0.0.0</bind-address>
        </tcp-listener>
    </listeners>

    <anonymous-usage-statistics>
        <enabled>true</enabled>
    </anonymous-usage-statistics>

</hivemq>
```

## UŻYTE TECHNOLOGIE / BLIBLOTEKI

Frontend:

- axios
- chart.js
- country-flag-icons
- formik
- js-cookie
- material UI
- mqtt
- react (17.0.1)
- react-custom-roulette
- react-hooks-sse
- react-router-dom
- uuid
- yup

Backend:

- axios
- crypto-js
- cors
- fs
- https
- lodash
- mqtt
- neo4j-driver
- sse-channel
- uuid

Jako baza danych został użyty Neo4j

## FUNKCJONALNOŚCI

- dostępny jest formularz logowania i rejestracji z odpowiednią walidacją
- dodany self-signed certificate
- używanie protokołu SSE, w celu wyświetlania losowego cytatu o hazardzie na stronie z logowaniem
- rola administratora, który może wyczyścić i edytować historię
- szyfrowanie haseł w bazie danych
- każdy użytkownik ma dostęp do ruletki, możliwości doładowania konta, historii gier (może ona zostać usunięta i edytowana przez administratora) oraz do statystyk, gdzie prezentowanych jest top 10 osób, które mają największą wartość konta (tabela odświeżana jest na bieżąco za pomocą mqtt)
- Użytkownik może obstawiać pieniądze na wybrany przez siebie kolor, wszyscy użytkownicy którzy obstawili w danej rundzie wyświetlani są w odpowiedniej tabelce (za pomocą mqtt), tabela czyszczona jest po zakończeniu rundy
- Użytkownik ma dostęp do okna, w którym widzi ile pieniędzy obstawił w danej rundzie, w tym miejscu może usunąć swoje obstawienie, dopóki nie rozpocznie się nowa runda
- Każdy użytkownik ma dostęp do chatu z 3 pokojami
- Na chacie wyświetlana jest informacja jeśli dołącza do niego jakiś użytkownik oraz z chatu usuwana jest ostatnia wiadomość jeśli ich liczba przekroczy 10
- Każdy użytkownik ma możliwość edytowania oraz usunięcia wiadomości
- Każdy użytkownik może usunąć swoje konto z serwisu lub zmienić swoje hasło

## STATUS PROJEKTU

Projekt został zakończony (18.01.2022)

## ZRZUTY EKRANU

<img src="./jpg/Zrzut ekranu 2022-02-27 024651.png"/>
<img src="./jpg/Zrzut ekranu 2022-02-27 024711.png"/>
<img src="./jpg/Zrzut ekranu 2022-02-27 024731.png"/>
<img src="./jpg/Zrzut ekranu 2022-02-27 024749.png"/>
<img src="./jpg/Zrzut ekranu 2022-02-27 024812.png"/>
<img src="./jpg/Zrzut ekranu 2022-02-27 024834.png"/>
