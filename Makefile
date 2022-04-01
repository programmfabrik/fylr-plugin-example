all:
	$(MAKE) -C fylr_example
	zip -r fylr_example.zip fylr_example
clean:
	rm -f fylr_example.zip