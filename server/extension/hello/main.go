package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/programmfabrik/golib"
)

type answer struct {
	Hello string         `json:"hello"`
	Info  map[string]any `json:"info"`
}

func main() {
	res := answer{}
	what := "World!"
	if len(os.Args) > 1 {
		what = os.Args[1]
	}
	res.Hello = "Hello " + what
	if len(os.Args) > 2 {
		err := json.Unmarshal([]byte(os.Args[2]), &res.Info)
		if err != nil {
			res.Info = map[string]any{
				"Error": err.Error(),
			}
		}
	}
	fmt.Println(golib.JsonStringIndent(res, "", "    "))
}
