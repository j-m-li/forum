
URL=$(WEBSITEFTP):sites/nocop.yright.it/

all:  
	scp .htaccess *.php *.ico *.html *.txt  $(URL)
	scp -r wp-admin wp-includes wp-content data $(URL)
	scp -r data $(URL)../
	@echo ok!
	
build/robots.txt: robots.txt
	cat $^ > $@ 
	scp $@ $(URL)$@

build/.htaccess: .htaccess
	cat $^ > $@ 
	scp $@ $(URL).htaccess


%.html: ../%.html
	tidy -i -w 1024 --preserve-entities yes --show-info no --warn-proprietary-attributes no $^ | grep -v "Tidy for HTML5" > $@ 
	scp $@ $(URL)$<

#%.html: ../%.md
#	node md.js $^ 
#	mv  $(dir $@)/../$(notdir $<) $@
#	scp $@ $(URL)$<

optim:
	jpegoptim -s  -S80 img/head.jpg

clean:
	rm -f build/*


